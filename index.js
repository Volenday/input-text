import React, { Component } from 'react';
import unidecode from 'unidecode';
import Cleave from 'cleave.js/react';
import { Form, Input } from 'antd';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@volenday/ckeditor5-build-classic';

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
			let blocks = format.map(d => parseInt(d.characterLength)),
				delimiters = format.map(d => d.delimiter);
			delimiters.pop();
			return (
				<Cleave
					autoComplete="off"
					class="ant-input"
					disabled={disabled}
					name={id}
					onBlur={onBlur}
					onChange={e => this.onChange({ target: { name: id, value: e.target.rawValue } }, e.target.rawValue)}
					onKeyPress={e => {
						if (e.key === 'Enter') {
							onPressEnter(e);
						}
					}}
					options={{ delimiters, blocks }}
					placeholder={placeholder || label || id}
					style={{ width: '100%', ...newStyles }}
					value={this.handleFontCase(uppercase, value) || ''}
				/>
			);
		}

		return (
			<Input
				allowClear
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
				autosize={{ minRows: 2, maxRows: 6 }}
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
		const { disabled = false, id, onBlur = () => {}, value = '' } = this.props;

		return (
			<CKEditor
				disabled={disabled}
				data={value}
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
			label = '',
			multiple,
			required = false,
			richText = false,
			withLabel = false
		} = this.props;

		const formItemCommonProps = {
			colon: false,
			help: error ? error : '',
			label: withLabel ? label : false,
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
