/**
 * 打包 packages 目录下的模块，最终打包 js 文件
 */

import minimist from 'minimist';
import {resolve, dirname} from 'path';
import {fileURLToPath} from 'url';
import {createRequire} from 'module';
import esbuild from 'esbuild';

// 命令行参数可以通过 process.argv 获取
const argv = minimist(process.argv.slice(2));

const __filename = fileURLToPath(import.meta.url);
// esm 不支持 __dirname
const __dirname = dirname(__filename);
// esm 使用common js 变量
const require = createRequire(import.meta.url);

const target = argv._[0] || 'reactivity'; // 打包项目
const format = argv.f || 'iife'; // 打包格式

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));

esbuild.context({
    entryPoints: [entry], // 入口
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 输出目录
    bundle: true, // 是否会打包在一起
    sourcemap: true, // 是否生成sourcemap
    platform: 'browser', // 平台
    format, // 打包格式
    globalName: pkg.buildOptions?.name, // 打包后 iife 的全局变量名
}).then(ctx => {
    return ctx.watch()
})