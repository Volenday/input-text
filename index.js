import React, { Component } from 'react';
import unidecode from 'unidecode';
import Cleave from 'cleave.js/react';
import InputDate from '@volenday/input-date';
import validate from 'validate.js';
import { Button, Form, Input, Popover } from 'antd';

import './styles.css';

// RichText
import { EditorState, convertToRaw, ContentState, SelectionState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

export default class InputText extends Component {
	state = {
		errors: [],
		hasChange: false,
		isPopoverVisible: false,
		action: '',
		editorState: EditorState.createEmpty()
	};

	componentDidMount() {
		const { richText = false } = this.props;

		if (richText) {
			require('react-draft-wysiwyg/dist/react-draft-wysiwyg.css');
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.value !== prevProps.value) {
			const { value = '', richText = false } = this.props;
			if (richText) {
				if (value) {
					const contentBlock = htmlToDraft(value);
					if (contentBlock) {
						const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
						const editorState = EditorState.createWithContent(contentState);
						this.setState({ editorState: this.moveEditorSelectionToEnd(editorState) });
					}
				}
			}
		}
	}

	handleFontCase = (isUpperCase, value = '') => (isUpperCase ? unidecode(value).toUpperCase() : unidecode(value));

	// Workaround for DraftJs to focus at the last word instead of the first line when focused while typing
	moveEditorSelectionToEnd = editorState => {
		const content = editorState.getCurrentContent();
		const blockMap = content.getBlockMap();

		const key = blockMap.last().getKey();
		const length = blockMap.last().getLength();

		const selection = new SelectionState({
			anchorKey: key,
			anchorOffset: length,
			focusKey: key,
			focusOffset: length
		});

		return EditorState.forceSelection(editorState, selection);
	};

	// Upload callback workaround that handles uploading an image in DraftJs
	uploadCallback(file) {
		return new Promise(resolve => {
			var reader = new FileReader();

			reader.onloadend = () => {
				resolve({ data: { link: reader.result } });
			};

			reader.readAsDataURL(file);
		});
	}

	onChange = async value => {
		const { action, id, onChange, onValidate, uppercase } = this.props;

		value = this.handleFontCase(uppercase, value);

		onChange(id, value);
		const errors = this.validate(value);
		await this.setState({ errors, hasChange: action === 'add' ? false : true });
		if (onValidate) onValidate(id, errors);
	};

	validate = value => {
		const { id, required = false } = this.props;

		const constraints = {
			[id]: {
				presence: { allowEmpty: !required }
			}
		};

		const errors = validate({ [id]: value }, constraints);
		return validate.isEmpty(value) && !required ? [] : errors ? errors[id] : [];
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
					onChange={e => this.onChange(e.target.rawValue)}
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
				onChange={e => this.onChange(e.target.value)}
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
				onChange={e => this.onChange(e.target.value)}
				onPressEnter={onPressEnter}
				placeholder={placeholder || label || id}
				style={{ width: '100%', ...newStyles }}
				value={this.handleFontCase(uppercase, value) || ''}
			/>
		);
	}

	renderRichText() {
		const { id, action, disabled = false, onBlur = () => {}, onChange, uppercase = false, value = '' } = this.props;
		const { localValue, editorState } = this.state;
		const config = { image: { uploadCallback: this.uploadCallback, previewImage: true } };

		return (
			<Editor
				editorClassName={uppercase ? 'draft-uppercase' : undefined}
				editorState={editorState}
				onBlur={onBlur}
				onEditorStateChange={editorState => {
					this.onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
					this.setState({ editorState, hasChange: action === 'add' ? false : true });
				}}
				readOnly={disabled}
				toolbar={config}
			/>
		);
	}

	handlePopoverVisible = visible => {
		this.setState({ isPopoverVisible: visible });
	};

	renderPopover = () => {
		const { isPopoverVisible } = this.state;
		const { id, label = '', historyTrackValue = '', onHistoryTrackChange } = this.props;

		return (
			<Popover
				content={
					<InputDate
						id={id}
						label={label}
						required={true}
						withTime={true}
						withLabel={true}
						value={historyTrackValue}
						onChange={onHistoryTrackChange}
					/>
				}
				trigger="click"
				title="History Track"
				visible={isPopoverVisible}
				onVisibleChange={this.handlePopoverVisible}>
				<span class="float-right">
					<Button
						type="link"
						shape="circle-outline"
						icon="warning"
						size="small"
						style={{ color: '#ffc107' }}
					/>
				</span>
			</Popover>
		);
	};

	render() {
		const { errors, hasChange } = this.state;
		const {
			action,
			historyTrack = false,
			label = '',
			multiple,
			required = false,
			richText = false,
			withLabel = false
		} = this.props;

		const formItemCommonProps = {
			colon: false,
			help: errors.length != 0 ? errors[0] : '',
			label: withLabel ? label : false,
			required,
			validateStatus: errors.length != 0 ? 'error' : 'success'
		};

		return (
			<Form.Item {...formItemCommonProps}>
				{historyTrack && hasChange && action !== 'add' && this.renderPopover()}
				{multiple ? (richText ? this.renderRichText() : this.renderTextArea()) : this.renderInputText()}
			</Form.Item>
		);
	}
}
