import React from 'react';
import unidecode from 'unidecode';
import { Form, Input } from 'antd';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@volenday/ckeditor5-build-classic';
import InputMask from 'react-input-mask';

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

	const onChangeInternal = async (e, value) => {
		const { id, onChange, uppercase } = this.props;
		onChange(e, id, handleFontCase(uppercase, value));
	};

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
				onPressEnter={onPressEnter}
				placeholder={placeholder || label || id}
				style={{ width: '100%', ...newStyles }}
				value={handleFontCase(uppercase, value) || ''}
			/>
		);
	};

	const renderRichText = () => {
		return (
			<CKEditor
				disabled={disabled}
				data={value}
				onFocus={onFocus}
				editor={ClassicEditor}
				onChange={(event, editor) => {
					const value = editor.getData();
					onChangeInternal({ target: { name: id, value } }, value);
				}}
				onBlur={onBlur}
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
