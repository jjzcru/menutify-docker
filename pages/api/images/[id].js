import fs from 'fs';
import path from 'path';
import getConfig from 'next/config'
const { serverRuntimeConfig } = getConfig()

export default async (req, res) => {
    switch (req.method) {
        case 'GET':
            await getImages(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getImages(req, res) {
    const {
        query: { id },
    } = req;

    try {
        const data = getData(id);
        if(!data) {
            res.status(404).send({error: 'Images not found'});
            return;
        }
        const {images, title} = data;
        res.send({images, title});
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

function getData(id) {
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
    
    return data[id];
}