#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var fse = __importStar(require("fs-extra"));
var commander_1 = require("commander");
var chalk_1 = __importDefault(require("chalk"));
var boxen_1 = __importDefault(require("boxen"));
var ora_1 = __importDefault(require("ora"));
var terminal_link_1 = __importDefault(require("terminal-link"));
var image_size_1 = require("image-size");
var node_fetch_1 = __importDefault(require("node-fetch"));
var content_disposition_1 = __importDefault(require("content-disposition"));
var google_reverse_image_search_1 = require("google-reverse-image-search");
var spinner = ora_1.default({ color: "gray", text: "Initializing..." });
var formatNoResults = function (local) {
    return boxen_1.default("\nOriginal: " + local.path + " - " + local.width + "x" + local.height + "\nSearch returned 0 results\n", {
        padding: 1,
        margin: 1,
        borderStyle: "round" /* Round */,
        borderColor: "yellow",
    });
};
var formatNoLarger = function (local, than) {
    var suffix = than ? " than minimum resolution " + commander_1.program.min : "";
    return boxen_1.default("\nOriginal: " + local.path + " - " + local.width + "x" + local.height + "\nNone of the results are of higher resolution" + suffix + "\n", {
        padding: 1,
        margin: 1,
        borderStyle: "round" /* Round */,
        borderColor: "yellow",
    });
};
var formatSuccess = function (local, remote, filePath) {
    var rel = path.relative(process.cwd(), filePath);
    var source = new URL(remote.page);
    return boxen_1.default("\nOriginal: " + local.path + " - " + local.width + "x" + local.height + "\nFound:    " + rel + " - " + remote.width + "x" + remote.height + "\nSource:   " + terminal_link_1.default(source.origin, source.toString(), { fallback: false }) + "\n", {
        padding: 1,
        margin: 1,
        borderStyle: "round" /* Round */,
        borderColor: "green"
    });
};
commander_1.program.version("1.0.0")
    .option("-d, --dir <directory>", "Directory for saving downloaded images", "./HiRes")
    .option("-k, --keep-filename", "Rename downloaded images to match source files")
    .option("-o, --overwrite", "Overwrite files when filenames clash")
    .option("-r, --remove", "Delete source files")
    .option("-c, --compare-by <dimension>", "Dimension to compare by or \"any\"", "auto")
    .option("-m, --min <resolution>", "Minumum resolution for downloaded images", "0x0")
    .option("-p, --pages <num>", "Result pages to parse", "3")
    .option("-q, --quiet", "Surpress output and ignore errors")
    .arguments("<images...>")
    .action(function (images) { return main(images); });
commander_1.program.parse();
function main(images) {
    return __awaiter(this, void 0, void 0, function () {
        var gris, _loop_1, _i, images_1, image;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!commander_1.program.quiet)
                        spinner.start();
                    return [4 /*yield*/, new google_reverse_image_search_1.GRIS().ready];
                case 1:
                    gris = _a.sent();
                    return [4 /*yield*/, message("green", "Ready!")];
                case 2:
                    _a.sent();
                    _loop_1 = function (image) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, message("green", "Processing " + image)
                                        .then(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var local, pages, results, i, _a, _b, matches, remote, minimum, sizes, width, height, filePath;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    local = processLocal(image);
                                                    if (!local) {
                                                        perror(chalk_1.default.red("Error reading file at " + image));
                                                        return [2 /*return*/];
                                                    }
                                                    pages = parseInt(commander_1.program.pages) || 3;
                                                    results = [];
                                                    i = 0;
                                                    _c.label = 1;
                                                case 1:
                                                    if (!(i < pages)) return [3 /*break*/, 5];
                                                    return [4 /*yield*/, message("gray", "Performing reverse image search for " + image + " (" + (i + 1) + "/" + pages + ")")];
                                                case 2:
                                                    _c.sent();
                                                    _b = (_a = results).push;
                                                    return [4 /*yield*/, gris.searchByFile(local.fullPath, i)];
                                                case 3:
                                                    _b.apply(_a, [_c.sent()]);
                                                    _c.label = 4;
                                                case 4:
                                                    i++;
                                                    return [3 /*break*/, 1];
                                                case 5: return [4 /*yield*/, message("green", "Done!")];
                                                case 6:
                                                    _c.sent();
                                                    matches = results.flat();
                                                    if (!matches.length) {
                                                        print(formatNoResults(local));
                                                        return [2 /*return*/];
                                                    }
                                                    matches.sort(compare);
                                                    remote = matches.find(function (r) { return findByDimension(local, r); });
                                                    if (!remote) {
                                                        print(formatNoLarger(local));
                                                        return [2 /*return*/];
                                                    }
                                                    minimum = { width: 0, height: 0 };
                                                    try {
                                                        sizes = commander_1.program.min.toLowerCase().split("x");
                                                        width = sizes[0], height = sizes[1];
                                                        minimum = { width: parseInt(width), height: parseInt(height) };
                                                    }
                                                    catch (err) {
                                                        perror(chalk_1.default.red(err.message));
                                                        perror(chalk_1.default.red("Unknow minimum resolution format \"" + commander_1.program.min + "\". Falling back to default 0x0"));
                                                        return [2 /*return*/];
                                                    }
                                                    if (isNaN(minimum.width) || isNaN(minimum.height)) {
                                                        perror(chalk_1.default.red("Unknow minimum resolution format \"" + commander_1.program.min + "\". Falling back to default 0x0"));
                                                        return [2 /*return*/];
                                                    }
                                                    if (!(remote.width >= minimum.width && remote.height >= minimum.height)) return [3 /*break*/, 13];
                                                    return [4 /*yield*/, message("gray", "Downloading " + remote.image)];
                                                case 7:
                                                    _c.sent();
                                                    return [4 /*yield*/, download(remote, local).catch(function (err) { return perror(chalk_1.default.red(err.message)); })];
                                                case 8:
                                                    filePath = _c.sent();
                                                    if (!filePath) return [3 /*break*/, 11];
                                                    print(formatSuccess(local, remote, filePath));
                                                    if (!commander_1.program.remove) return [3 /*break*/, 11];
                                                    return [4 /*yield*/, message("yellow", "Removing source file")];
                                                case 9:
                                                    _c.sent();
                                                    return [4 /*yield*/, fse.unlink(local.fullPath).catch(function (err) { return perror(chalk_1.default.red(err.message)); })];
                                                case 10:
                                                    _c.sent();
                                                    _c.label = 11;
                                                case 11: return [4 /*yield*/, message(filePath ? "green" : "red", filePath ? "Downloaded to " + filePath : "Download failed!")];
                                                case 12:
                                                    _c.sent();
                                                    return [3 /*break*/, 14];
                                                case 13:
                                                    print(formatNoLarger(local, true));
                                                    _c.label = 14;
                                                case 14: return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, images_1 = images;
                    _a.label = 3;
                case 3:
                    if (!(_i < images_1.length)) return [3 /*break*/, 6];
                    image = images_1[_i];
                    return [5 /*yield**/, _loop_1(image)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    gris.kill().then(function () { if (!commander_1.program.quiet)
                        spinner.succeed("All done!"); });
                    return [2 /*return*/];
            }
        });
    });
}
function processLocal(image) {
    var fullPath = path.resolve(image);
    try {
        if (!fse.existsSync(fullPath)) {
            return null;
        }
        var size = image_size_1.imageSize(fullPath);
        return {
            path: image,
            fullPath: fullPath,
            fileName: path.basename(image),
            width: size.width,
            height: size.height,
            orientation: size.width > size.height ? "horizontal" : size.width < size.height ? "vertical" : "square",
        };
    }
    catch (err) {
        perror(chalk_1.default.red(err.message));
        return null;
    }
}
function compare(local, remote) {
    var localSize = local.width * local.height;
    var remoteSize = remote.width * remote.height;
    return localSize - remoteSize;
}
function findByDimension(local, remote) {
    var _a;
    var compareBy = (_a = commander_1.program.compareBy) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (compareBy === "any") {
        return local.width < remote.width || local.height < remote.height;
    }
    else if (["height", "h"].includes(compareBy)) {
        return local.height < remote.height;
    }
    else if (["width", "w"].includes(compareBy)) {
        return local.width < remote.width;
    }
    else {
        if (local.orientation === "vertical") {
            return local.height < remote.height;
        }
        else if (local.orientation === "horizontal") {
            return local.width < remote.width;
        }
        else {
            return local.width < remote.width || local.height < remote.height;
        }
    }
}
function download(remote, local) {
    return node_fetch_1.default(remote.image).then(function (response) {
        var urlFileName = path.basename(new URL(remote.image).pathname);
        var disposition = response.headers.get("Content-Disposition") || "attachment; filename=\"" + urlFileName + "\"";
        var fileName = commander_1.program.keepFilename ? local.fileName : content_disposition_1.default.parse(disposition).parameters.filename;
        var filePath = path.join(path.resolve(commander_1.program.dir), fileName);
        if (fse.existsSync(filePath) && !commander_1.program.overwrite) {
            throw new Error(filePath + " already exists! Choose different path or specify \"--overwrite\" flag");
        }
        fse.mkdirpSync(path.resolve(commander_1.program.dir));
        var writeStream = fse.createWriteStream(filePath);
        return new Promise(function (resolve, reject) {
            response.body.pipe(writeStream);
            response.body.on("error", function (err) { return reject(err); });
            writeStream.on("finish", function () { return resolve(filePath); });
        });
    });
}
function print(text) {
    if (!commander_1.program.quiet) {
        spinner.stop();
        console.log(text);
        spinner.start();
    }
}
function perror(text) {
    if (!commander_1.program.quiet) {
        spinner.stop();
        console.error(text);
        spinner.start();
    }
}
function message(color, text) {
    spinner.color = color;
    spinner.text = text;
    return sleep(750);
}
function sleep(time) {
    return new Promise(function (resolve) { return setTimeout(resolve, time); });
}
