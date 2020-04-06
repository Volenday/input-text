import React from 'react';
import unidecode from 'unidecode';
import { Form, Input } from 'antd';
import InputMask from 'react-input-mask';
import { Editor } from '@tinymce/tinymce-react';

import './styles.css';

export default ({
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
	uppercase = false,
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
					onBlur={onBlur}
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

		return (
			<Input
				autoComplete="off"
				disabled={disabled}
				name={id}
				onBlur={onBlur}
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
		let newStyles = { ...styles };
		if (uppercase) newStyles = { ...newStyles, textTransform: 'uppercase' };

		return (
			<Input.TextArea
				autoComplete="off"
				autoSize={{ minRows: 2, maxRows: 6 }}
				disabled={disabled}
				name={id}
				onBlur={onBlur}
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
		return (
			<Editor
				apiKey="ivu5up7uakmp0q5juv2c29ncqug7wavbo30walskhag8oz6p"
				disabled={disabled}
				init={{
					plugins:
						'preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
					menubar: 'file edit view insert format tools table',
					toolbar:
						'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
					toolbar_sticky: true,
					autosave_ask_before_unload: true,
					autosave_interval: '30s',
					autosave_prefix: '{path}{query}-{id}-',
					autosave_restore_when_empty: false,
					autosave_retention: '2m',
					image_advtab: true,
					content_css: '//www.tiny.cloud/css/codepen.min.css',
					importcss_append: true,
					height: 300,
					image_caption: true,
					quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
					toolbar_mode: 'sliding',
					contextmenu: 'link image imagetools table'
				}}
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
				<div style={{ float: 'right' }}>{extra}</div> <span class="label">{label}</span>
			</>
		) : (
			false
		),
		required,
		validateStatus: error ? 'error' : 'success'
	};

	return (
		<Form.Item {...formItemCommonProps}>
			{multiple ? (richText ? renderRichText() : renderTextArea()) : renderInputText()}
		</Form.Item>
	);
};
