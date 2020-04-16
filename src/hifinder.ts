#!/usr/bin/env node

import * as path from "path";
import * as fse from "fs-extra";
import { program } from "commander";
import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";
import link from "terminal-link";
import { imageSize } from "image-size";
import fetch from "node-fetch";
import cd from "content-disposition";
import { GRIS, SearchResult } from "google-reverse-image-search";


const spinner = ora({ color: "gray", text: "Initializing..." });
const formatNoResults = (local: LocalImage) => {
	return boxen(`
Original: ${local.path} - ${local.width}x${local.height}
Search returned 0 results
`, {
	padding: 1,
	margin: 1,
	borderStyle: boxen.BorderStyle.Round,
	borderColor: "yellow",
});
};
const formatNoLarger = (local: LocalImage, than?: boolean) => {
	const suffix = than ? ` than minimum resolution ${program.min}` : "";
	return boxen(`
Original: ${local.path} - ${local.width}x${local.height}
None of the results are of higher resolution${suffix}
`, {
	padding: 1,
	margin: 1,
	borderStyle: boxen.BorderStyle.Round,
	borderColor: "yellow",
});
};
const formatSuccess = (local: LocalImage, remote: SearchResult, filePath: string) => {
	const rel = path.relative(process.cwd(), filePath);
	const source = new URL(remote.page);
	return boxen(`
Original: ${local.path} - ${local.width}x${local.height}
Found:    ${rel} - ${remote.width}x${remote.height}
Source:   ${link(source.origin, source.toString(), { fallback: false })}
`, {
	padding: 1,
	margin: 1,
	borderStyle: boxen.BorderStyle.Round,
	borderColor: "green"
});
};


interface LocalImage {
	path: string;
	fullPath: string;
	fileName: string;
	width: number;
	height: number;
	orientation: "vertical" | "horizontal" | "square";
}


program.version("1.0.0")
	.option("-d, --dir <directory>", "Directory for saving downloaded images", "./HiRes")
	.option("-k, --keep-filename", "Rename downloaded images to match source files")
	.option("-o, --overwrite", "Overwrite files when filenames clash")
	.option("-r, --remove", "Delete source files")
	.option("-c, --compare-by <dimension>", "Dimension to compare by or \"any\"", "auto")
	.option("-m, --min <resolution>", "Minumum resolution for downloaded images", "0x0")
	.option("-p, --pages <num>", "Result pages to parse", "3")
	.option("-q, --quiet", "Surpress output and ignore errors")
	.arguments("<images...>")
	.action((images: string[]) => main(images));


program.parse();


async function main(images: string[]) {
	if (!program.quiet) spinner.start();

	const gris = await new GRIS().ready;

	await message("green", "Ready!");

	for (const image of images) {
		await message("green", `Processing ${image}`)
			.then(async () => {
				const local = processLocal(image);

				if (!local) {
					perror(chalk.red(`Error reading file at ${image}`));
					return;
				}

				const pages = parseInt(program.pages) || 3;
				const results: Array<SearchResult[]> = [];
				for (let i = 0; i < pages; i++) {
					await message("gray", `Performing reverse image search for ${image} (${i + 1}/${pages})`);
					results.push(await gris.searchByFile(local.fullPath, i));
				}
				await message("green", "Done!");
				const matches = results.flat();

				if (!matches.length) {
					print(formatNoResults(local));
					return;
				}

				matches.sort(compare);

				const remote = matches.find((r) => findByDimension(local, r));

				if (!remote) {
					print(formatNoLarger(local));
					return;
				}

				let minimum: { width: number, height: number } = { width: 0, height: 0 };
				try {
					const sizes = program.min.toLowerCase().split("x");
					const [width, height] = sizes;
					minimum = { width: parseInt(width), height: parseInt(height) };
				} catch (err) {
					perror(chalk.red(err.message));
					perror(chalk.red(`Unknow minimum resolution format "${program.min}". Falling back to default 0x0`));
					return;
				}
				if (isNaN(minimum.width) || isNaN(minimum.height)) {
					perror(chalk.red(`Unknow minimum resolution format "${program.min}". Falling back to default 0x0`));
					return;
				}

				if (remote.width >= minimum.width && remote.height >= minimum.height) {
					await message("gray", `Downloading ${remote.image}`);
					const filePath = await download(remote, local).catch((err) => perror(chalk.red(err.message)));
					if (filePath) {
						print(formatSuccess(local, remote, filePath));
						if (program.remove) {
							await message("yellow", "Removing source file");
							await fse.unlink(local.fullPath).catch((err) => perror(chalk.red(err.message)));
						}
					}
					await message(filePath ? "green" : "red", filePath ? `Downloaded to ${filePath}` : "Download failed!");
				} else {
					print(formatNoLarger(local, true));
				}
			});
	}

	gris.kill().then(() => { if (!program.quiet) spinner.succeed("All done!"); });
}


function processLocal(image: string): LocalImage | null {
	const fullPath = path.resolve(image);
	try {
		if (!fse.existsSync(fullPath)) {
			return null;
		}
		const size = <{ width: number, height: number }> <unknown> imageSize(fullPath);
		return {
			path: image,
			fullPath,
			fileName: path.basename(image),
			width: size.width as number,
			height: size.height as number,
			orientation: size.width > size.height ? "horizontal" : size.width < size.height ? "vertical" : "square",
		}
	} catch (err) {
		perror(chalk.red(err.message));
		return null;
	}
}


function compare(local: LocalImage | SearchResult, remote: SearchResult): number {
	const localSize = local.width * local.height;
	const remoteSize = remote.width * remote.height;
	return localSize - remoteSize;
}


function findByDimension(local: LocalImage, remote: SearchResult): boolean {
	const compareBy: string = program.compareBy?.toLowerCase();
	if (compareBy === "any") {
		return local.width < remote.width || local.height < remote.height;
	} else if (["height", "h"].includes(compareBy)) {
		return local.height < remote.height;
	} else if (["width", "w"].includes(compareBy)) {
		return local.width < remote.width;
	} else {
		if (local.orientation === "vertical") {
			return local.height < remote.height;
		} else if (local.orientation === "horizontal") {
			return local.width < remote.width;
		} else {
			return local.width < remote.width || local.height < remote.height;
		}
	}
}


function download(remote: SearchResult, local: LocalImage): Promise<string> {
	return fetch(remote.image).then((response) => {
		const urlFileName = path.basename(new URL(remote.image).pathname);
		const disposition = response.headers.get("Content-Disposition") || `attachment; filename="${urlFileName}"`;
		const fileName = program.keepFilename ? local.fileName : cd.parse(disposition).parameters.filename;
		const filePath = path.join(path.resolve(program.dir), fileName);
		if (fse.existsSync(filePath) && !program.overwrite) {
			throw new Error(`${filePath} already exists! Choose different path or specify "--overwrite" flag`);
		}
		fse.mkdirpSync(path.resolve(program.dir));
		const writeStream = fse.createWriteStream(filePath);
		return new Promise((resolve, reject) => {
			response.body.pipe(writeStream)
			response.body.on("error", (err) => reject(err));
			writeStream.on("finish", () => resolve(filePath));
		});
	});
}


function print(text: string) {
	if (!program.quiet) {
		spinner.stop();
		console.log(text);
		spinner.start();
	}
}


function perror(text: string) {
	if (!program.quiet) {
		spinner.stop();
		console.error(text);
		spinner.start();
	}
}


function message(color: ora.Color, text: string) {
	spinner.color = color;
	spinner.text = text;
	return sleep(750);
}


function sleep(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
