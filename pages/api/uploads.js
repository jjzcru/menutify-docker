import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import {exec} from 'child_process';

import getConfig from 'next/config'
const { serverRuntimeConfig } = getConfig()

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async (req, res) => {
	const id = req.headers['x-menutify-id'] || createUUID();
	const title = req.headers['x-menutify-title'];
	const host = process.env.HOST || 'http://localhost:3000';

	const form = new formidable.IncomingForm();
	const uploadDir = './uploads';
	form.uploadDir = uploadDir; //'./uploads';
	form.keepExtensions = true;
	let images;

	try {
		const pdf = await getPdfPath(req, form);
		const pdfPath = path.resolve(path.join(serverRuntimeConfig.PROJECT_ROOT, pdf.path));
		
		const info = await getPDFInfo(pdfPath);
		const totalOfPages = parseInt(`${info.Pages}`);
		const images = await transformPdfToImages(totalOfPages, pdfPath);

		fs.unlinkSync(pdfPath);
		
		saveData({id, images, title: !!title ? title : pdf.name})
		res.send({ id, host, title: !!title ? title : pdf.name });
	} catch (e) {
		res.status(500).send({ error: e.message });
	}
};

function saveData({id, images, title}) {
	const dataPath = path.join(serverRuntimeConfig.PROJECT_ROOT, 'data.json')
	if(!fs.existsSync(dataPath)) {
		fs.writeFileSync(dataPath, '{}');
	}

	const content = fs.readFileSync(dataPath);
	let data;
	try {
		data = JSON.parse(content);
	} catch(e) {
		data = {};
	}


	data[id] = {
		images,
		title
	};
	fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
}

async function getPdfPath(req, form) {
	return new Promise((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				reject(err);
				return;
			}
			for (let k in files) {
				const file = files[k];
				const { path, name } = file;
				resolve({
					path,
					name: name.replace('.pdf', ''),
				});
			}
		});
	});
}

async function getPDFInfo(pdfPath){
	return new Promise((resolve, reject) => {
		exec(`pdfinfo "${pdfPath}"`, (err, stdout) => {
			if (!!err) {
				console.error(err);
				reject(new Error('Error reading pdf file'));
				return;
			}

			var pdfInfo = {};
			var infoSplit = stdout.split('\n');
			for (var line of infoSplit) {
				var aux = line.split(':');
				pdfInfo[aux[0].trim()] = aux[1] ? aux[1].trim() : '';
			}
			resolve(pdfInfo);
		});
	});
}

async function transformPdfToImages(totalOfPages, pdfPath) {
	const images = [];
	for(let i = 0; i< totalOfPages; i++) {
		images.push(await convertPage(pdfPath, i));
	}

	return images;
}

async function convertPage(pdfPath, index) {
	return new Promise((resolve, reject) => {
		const imagePath = path.resolve(path.join(serverRuntimeConfig.PROJECT_ROOT, 'public', 'images'));
		const id = createUUID();
		const imageName = `${id}.png`;
		const targetPath = path.join(imagePath, imageName);

		const cmd = `convert -quality 100 -density 100 "${pdfPath}[${index}]" "${targetPath}"`;
		
		exec(cmd, async err => {
			if (err !== null) {
				console.error(err);
				reject(new Error('Error converting the file'));
				return;
			}

			resolve(imageName);
		});
	});
}

function createUUID() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		function (c) {
			var r = (dt + Math.random() * 16) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
		}
	);
	return uuid;
}
