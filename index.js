import React, { Component } from 'react';
import unidecode from 'unidecode';
import { Form, Input } from 'antd';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@volenday/ckeditor5-build-classic';
import InputMask from 'react-input-mask';

import './styles.css';

export default class InputText extends Component {
	handleFontCase = (isUpperCase, value = '') => {
		if (typeof value != 'string') return '';
		return isUpperCase ? unidecode(value).toUpperCase() : unidecode(value);
	};

	onChange = async (e, value) => {
		const { id, onChange, uppercase } = this.props;
		onChange(e, id, this.handleFontCase(uppercase, value));
	};

	renderInputText() {
		const {
			disabled = false,
			format = [],
			id,
			label = '',
			onBlur = () => {},
			onPressEnter = () => {},
			placeholder = '',
			styles = {},
			uppercase = false,
			value = ''
		} = this.props;

		let newStyles = { ...styles };
		if (uppercase) {
			newStyles = { ...newStyles, textTransform: 'uppercase' };
		}

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
					onChange={e => this.onChange({ target: { name: id, value: e.target.value } }, e.target.value)}
					onKeyPress={e => {
						if (e.key === 'Enter') {
							onPressEnter(e);
						}
					}}
					placeholder={placeholder || label || id}
					style={{ width: '100%', ...newStyles }}
					value={this.handleFontCase(uppercase, value) || ''}>
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
				onChange={e => this.onChange(e, e.target.value)}
				onPressEnter={onPressEnter}
				placeholder={placeholder || label || id}
				style={{ width: '100%', ...styles }}
				type="text"
				value={this.handleFontCase(uppercase, value)}
			/>
		);
	}

	renderTextArea() {
		const {
			disabled = false,
			id,
			label = '',
			onBlur = () => {},
			onPressEnter = () => {},
			placeholder = '',
			styles = {},
			uppercase = false,
			value = ''
		} = this.props;

		let newStyles = { ...styles };
		if (uppercase) {
			newStyles = { ...newStyles, textTransform: 'uppercase' };
		}

		return (
			<Input.TextArea
				autoComplete="off"
				autoSize={{ minRows: 2, maxRows: 6 }}
				disabled={disabled}
				name={id}
				onBlur={onBlur}
				onChange={e => this.onChange(e, e.target.value)}
				onPressEnter={onPressEnter}
				placeholder={placeholder || label || id}
				style={{ width: '100%', ...newStyles }}
				value={this.handleFontCase(uppercase, value) || ''}
			/>
		);
	}

	renderRichText() {
		const { disabled = false, id, onBlur = () => {}, value = '', onFocus = () => {} } = this.props;

		return (
			<CKEditor
				disabled={disabled}
				data={value}
				onFocus={onFocus}
				editor={ClassicEditor}
				onChange={(event, editor) => {
					const value = editor.getData();
					this.onChange({ target: { name: id, value } }, value);
				}}
				onBlur={onBlur}
			/>
		);
	}

	render() {
		const {
			error = null,
			extra = null,
			label = '',
			multiple,
			required = false,
			richText = false,
			withLabel = false
		} = this.props;

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
				{multiple ? (richText ? this.renderRichText() : this.renderTextArea()) : this.renderInputText()}
			</Form.Item>
		);
	}
}
