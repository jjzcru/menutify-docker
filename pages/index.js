import Head from 'next/head';
import QRCode from 'qrcode';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import {
	ZeitProvider,
	CssBaseline,
	Button,
	Card,
	Row,
	Col,
	Grid,
	Tooltip,
	Loading,
	Input,
	Text,
	useToasts,
} from '@zeit-ui/react';

import { Copy } from '@zeit-ui/react-icons';

import styles from '../styles/Home.module.css';

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		const id = createUUID();
		console.log(id);
		this.state = {
			title: '',
			id,
			isLoading: false,
			file: null,
			uploadedComponent: null,
			data: null,
		};
	}

	onAcceptedFiles = (files) => {
		this.setState({
			file: files[0],
		});
	};

	onTitleChange = (title) => {
		this.setState({ title });
	};

	onIDChange = (id) => {
		this.setState({ id });
	};

	onUploadClick = () => {
		console.log(`In here i send the file`);
		this.setState({ isLoading: true });
		this.sendFile()
			.then((data) => {
				this.setState({ data, isLoading: false });
			})
			.catch(console.error);
	};

	sendFile = async () => {
		const { file, title, id } = this.state;
		var form = new FormData();
		form.append('file', file);
		const res = await fetch('/api/uploads', {
			method: 'POST',
			headers: {
				'x-menutify-id': id,
				'x-menutify-title': title,
			},
			body: form,
		});
		
		const data = res.json();
		return data;
	};

	render() {
		const { title, id, data, file, isLoading } = this.state;

		let idComponent = <ID onChange={this.onIDChange} id={id} />;

		idComponent = null;

		return (
			<ZeitProvider>
				<CssBaseline />
				<div className={styles.container}>
					<Head>
						<title>Menutify</title>
						<link rel="icon" href="/favicon.ico" />
					</Head>

					<main className={styles.main}>
						<Grid.Container gap={2} justify="center">
							<Grid xs={20} sm={12}>
								<Card
									shadow
									style={{ width: '100%', height: '100%' }}
								>
									<form>
										<Title
											onChange={this.onTitleChange}
											title={title}
										/>

										<Drop
											onAcceptedFiles={
												this.onAcceptedFiles
											}
											file={file}
										/>

										<SendButton
											isLoading={isLoading}
											onClick={this.onUploadClick}
											enable={!!file}
										/>
									</form>
								</Card>
							</Grid>
							<Data data={data} />
						</Grid.Container>
					</main>
				</div>
			</ZeitProvider>
		);
	}
}

function Data({ data }) {
	if (!data) {
		return null;
	}

	const [toasts, setToast] = useToasts();

	const { id, host, title } = data;
	const url = `${host}/menus/${id}`;

	let icon = null;

	if ('navigator' in window) {
		if(!!navigator.clipboard) {
			icon = (
				<Tooltip
					text={'Copy'}
					style={{ cursor: 'pointer' }}
					onClick={() => {
						navigator.clipboard.writeText(url);
						setToast({ text: 'Menu copy to clipboard' });
					}}
				>
					<Copy />
				</Tooltip>
			);
		} else if(navigator.share) {
			icon = (
				<div
					style={{ cursor: 'pointer' }}
					onClick={async () => {
						try {
							await navigator.share({
								title,
								url
							})
						} catch(e) {
							console.error(e);
						}
						
					}}
				>
					<Copy />
				</div>
			);
		}
		
	}

	return (
		<Grid xs={20} sm={12}>
			<Card shadow style={{ width: '100%', height: '100%' }}>
				<div className={styles['data-container']}>
					<Input
						label="URL"
						readOnly
						iconRight={icon}
						iconClickable={true}
						value={url}
						initialValue={url}
						width="100%"
					/>

					<Input
						label="Title"
						readOnly
						value={title}
						initialValue={title}
						width="100%"
					/>
					<Text h4>QR</Text>
					<QRComponent url={url} />
				</div>
			</Card>
		</Grid>
	);
}

function Title({ title, onChange }) {
	return (
		<div className={styles.title}>
			<Input
				onChange={(evt) => {
					onChange(evt.target.value);
				}}
				initialValue={title}
				value={title}
				placeholder="What's the name of your restaurant?"
				width="100%"
			>
				<Text h4>Title</Text>
			</Input>
		</div>
	);
}

class QRComponent extends React.Component {
	componentDidMount() {
		const { url } = this.props;
		QRCode.toCanvas(document.getElementById('canvas'), url, function (
			error
		) {
			if (error) console.error(error);
			console.log('success!');
		});
	}
	render() {
		return (
			<div className={styles.qr}>
				<canvas id="canvas" style={{ width: '90%', height: '90%' }} />
			</div>
		);
	}
}

function ID({ id, onChange }) {
	console.log(`ID: ${id}`);
	return (
		<div className={styles.title}>
			<Input readOnly value={id} initialValue={id} width="100%">
				<Text h4>ID</Text>
			</Input>
		</div>
	);
}

function Drop({ onAcceptedFiles, file }) {
	if (file) {
		const { name } = file;
		return (
			<div className={styles['drop-zone']}>
				<Text b>{name}</Text>
			</div>
		);
	}

	return (
		<div className={styles['drop-zone']}>
			<MyDropzone onAcceptedFiles={onAcceptedFiles} />
		</div>
	);
}

function MyDropzone({ onAcceptedFiles }) {
	const onDrop = useCallback((acceptedFiles) => {
		// Do something with the files
		onAcceptedFiles(acceptedFiles);
	}, []);
	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
	} = useDropzone({
		onDrop,
		accept: 'application/pdf',
	});

	return (
		<div {...getRootProps()}>
			<input {...getInputProps()} />
			{isDragAccept && (
				<p>
					Drop it like its <br />
					&#x1F525;
				</p>
			)}
			{isDragReject && <p>Only pdf files are available </p>}
			{!isDragActive && (
				<p>Drop the files here or click to upload them</p>
			)}
		</div>
	);
}

function SendButton({ onClick, enable, isLoading }) {
	if (!!isLoading) {
		return (
			<div className={styles['send-button']}>
				<Button disabled loading>
					Upload
				</Button>
			</div>
		);
	}
	if (!enable) {
		return (
			<div className={styles['send-button']}>
				<Button disabled>Upload</Button>
			</div>
		);
	}

	return (
		<div className={styles['send-button']}>
			<Button onClick={onClick}>Upload</Button>
		</div>
	);
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
