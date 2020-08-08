import Head from 'next/head';

export async function getServerSideProps(context) {
    const { id } = context.query;
    const host = process.env.HOST || 'http://localhost:3000';
    const url = `${host}/api/images/${id}`;
	const res = await fetch(url);
    const data = await res.json();
    let title = 'Menu';
    let images;
    if(!!data)  {
        title = data.title;
        images = data.images.map((image) => {
            return `${host}/images/${image}`
        });
    }
    
    
    return { props: { images, title } };
}

export default class ImagesComponent extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
        const { images, title} = this.props;
        
		return (
			<div style={{width: '100vw', background: 'gray'}}>
				<Head>
                    <title>{title}</title>
					<link rel="icon" href="/favicon.ico" />
				</Head>

				<main style={{width: '100vw', height: '100vh', background: 'gray'}}>
					<Images images={images} />
				</main>
			</div>
		);
	}
}

function Images({ images }) {
	return (
		<div
			className="image-container"
		>
			{images.map((image, i) => {
				return (
					<div key={i}>
						<img src={image}  style={{ height: '80vh', marginLeft: 'auto', marginRight: 'auto', background: 'white' }} />
					</div>
				);
			})}
		</div>
	);
}
