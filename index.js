import React, { memo } from 'react';
import unidecode from 'unidecode';
import { Form, Skeleton, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const browser = typeof window !== 'undefined' ? true : false;

if (browser) require('./styles.css');

const Index = ({
	basicView = false,
	disabled = false,
	error = null,
	extra = null,
	format = [],
	id,
	label = '',
	multiple,
	onBlur = () => {},
	onChange = () => {},
	onFocus = () => {},
	onPressEnter = () => {},
	placeholder = '',
	required = false,
	richText = false,
	styles = {},
	uploadUrl = null,
	uppercase = false,
	toolTip = '',
	value = '',
	withLabel = false
}) => {
	const handleFontCase = (isUpperCase, value = '') => {
		if (typeof value != 'string') return '';
		return isUpperCase ? unidecode(value).toUpperCase() : unidecode(value);
	};

	const onChangeInternal = async (e, value) => onChange(e, id, handleFontCase(uppercase, value));

	const renderInputText = () => {
		let newStyles = { ...styles };
		if (uppercase) newStyles = { ...newStyles, textTransform: 'uppercase' };

		if (format.length != 0) {
			const { Input } = require('antd');
			const InputMask = require('react-input-mask');

			const mask = format
				.map((d, i) => {
					if (d.type == 'alphanumeric') {
						let padChar = '*';
						let characters = ''.padStart(d.characterLength, padChar);
						return `${characters}${format.length - 1 != i ? d.delimiter : ''}`;
					} else if (d.type == 'numeric') {
						let padChar = '9';
						let characters = ''.padStart(d.characterLength, padChar);
						return `${characters}${format.length - 1 != i ? d.delimiter : ''}`;
					} else {
						let padChar = 'a';
						let characters = ''.padStart(d.characterLength, padChar);
						return `${characters}${format.length - 1 != i ? d.delimiter : ''}`;
					}
				})
				.join('');

			return (
				<InputMask
					mask={mask}
					alwaysShowMask={false}
					autoComplete="off"
					disabled={disabled}
					name={id}
					onBlur={e => {
						const newValue = e.target.value.trim();
						onChangeInternal({ target: { name: id, value: newValue } }, newValue);
						onBlur(e);
					}}
					onChange={e => onChangeInternal({ target: { name: id, value: e.target.value } }, e.target.value)}
					onFocus={onFocus}
					onKeyPress={e => {
						if (e.key === 'Enter') {
							onPressEnter(e);
						}
					}}
					placeholder={placeholder || label || id}
					style={{ width: '100%', ...newStyles }}
					value={handleFontCase(uppercase, value) || ''}>
					{inputProps => <Input {...inputProps} />}
				</InputMask>
			);
		}

		const { Input } = require('antd');

		return (
			<Input
				autoComplete="off"
				disabled={disabled}
				name={id}
				onBlur={e => {
					const newValue = e.target.value.trim();
					onChangeInternal({ target: { name: id, value: newValue } }, newValue);
					onBlur(e);
				}}
				onChange={e => onChangeInternal(e, e.target.value)}
				onFocus={onFocus}
				onPressEnter={onPressEnter}
				placeholder={placeholder || label || id}
				style={{ width: '100%', ...styles }}
				type="text"
				value={handleFontCase(uppercase, value)}
			/>
		);
	};

	const renderTextArea = () => {
		const { Input } = require('antd');

		let newStyles = { ...styles };
		if (uppercase) newStyles = { ...newStyles, textTransform: 'uppercase' };

		return (
			<Input.TextArea
				autoComplete="off"
				autoSize={{ minRows: 2, maxRows: 6 }}
				disabled={disabled}
				name={id}
				onBlur={e => {
					const newValue = e.target.value.trim();
					onChangeInternal({ target: { name: id, value: newValue } }, newValue);
					onBlur(e);
				}}
				onChange={e => onChangeInternal(e, e.target.value)}
				onFocus={onFocus}
				onPressEnter={onPressEnter}
				placeholder={placeholder || label || id}
				style={{ width: '100%', ...newStyles }}
				value={handleFontCase(uppercase, value) || ''}
			/>
		);
	};

	const renderRichText = () => {
		const { Editor } = require('@tinymce/tinymce-react');

		let initOptions = {
			browser_spellcheck: true,
			plugins:
				'searchreplace autolink directionality fullscreen image link media table hr anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable quickbars autoresize',
			menubar: false,
			toolbar:
				'removeformat | undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | insertfile image media link | fullscreen',
			toolbar_sticky: true,
			image_advtab: true,
			content_css: '//www.tiny.cloud/css/codepen.min.css',
			importcss_append: true,
			min_height: 75,
			image_caption: true,
			toolbar_mode: 'sliding',
			contextmenu: false,
			entity_encoding: 'raw',
			verify_html: false,
			referrer_policy: 'origin',
			statusbar: false,
			autoresize_bottom_margin: 15,
			autoresize_overflow_padding: 15,
			max_height: 700
		};

		if (basicView) {
			initOptions = {
				browser_spellcheck: true,
				contextmenu: false,
				entity_encoding: 'raw',
				min_height: 75,
				menubar: false,
				toolbar: 'removeformat | bold italic underline ' + ' bullist numlist outdent',
				content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:8pt }',
				referrer_policy: 'origin',
				verify_html: false,
				statusbar: false,
				icons_url: 'https://d3t9tvgbdc7c7w.cloudfront.net/production/icons/small_icon_pack/icons.js',
				icons: 'small_icon_pack',
				plugins: 'autoresize'
			};
		}

		if (uploadUrl) initOptions = { ...initOptions, images_upload_url: uploadUrl };

		return (
			<Editor
				apiKey="ivu5up7uakmp0q5juv2c29ncqug7wavbo30walskhag8oz6p"
				disabled={disabled}
				init={initOptions}
				onEditorChange={e => onChangeInternal({ target: { name: id, value: e } }, e)}
				value={value}
			/>
		);
	};

	const formItemCommonProps = {
		colon: false,
		help: error ? error : '',
		label: withLabel ? (
			<>
				<div style={{ float: 'right' }}>{extra}</div>{' '}
				<span class="label">
					{label}{' '}
					{toolTip && (
						<Tooltip title={toolTip}>
							{' '}
							<QuestionCircleOutlined />
						</Tooltip>
					)}
				</span>
			</>
		) : (
			false
		),
		required,
		validateStatus: error ? 'error' : 'success'
	};

	return (
		<Form.Item {...formItemCommonProps}>
			{browser ? (
				multiple ? (
					richText ? (
						renderRichText()
					) : (
						renderTextArea()
					)
				) : (
					renderInputText()
				)
			) : (
				<Skeleton active paragraph={{ rows: 1, width: '100%' }} title={false} />
			)}
		</Form.Item>
	);
};

export default memo(Index);
