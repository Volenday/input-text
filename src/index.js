import React, { Component, Fragment } from 'react';
import unidecode from 'unidecode';
import Cleave from 'cleave.js/react';
import InputDate from '@volenday/input-date';

// ant design
import { Button, Input, Popover, TextArea } from 'antd';

export default class InputText extends Component {
	initialState = { hasChange: false, isPopoverVisible: false, localValue: '', isFocused: false, action: '' };
	state = { ...this.initialState, initialState: this.initialState };
	editors = {};

	handleChange = value => {
		this.setState({ localValue: value, hasChange: true, isFocused: true });
	};

	handleFontCase = (isUpperCase, value = '') => {
		return isUpperCase ? unidecode(value).toUpperCase() : unidecode(value);
	};

	componentDidMount() {
		const { id, onChange, richText = false, uppercase = false } = this.props;
		const handleChange = this.handleChange;
		const handleFontCase = this.handleFontCase;
		if (richText) {
			this.editors[id] = $(`.summernote-${id}`);
			this.editors[id].summernote({
				minHeight: 346,
				popover: {
					image: [
						['custom', ['imageAttributes']],
						['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
						['float', ['floatLeft', 'floatRight', 'floatNone']],
						['remove', ['removeMedia']]
					]
				},
				lang: 'en-US',
				imageAttributes: {
					icon: '<i class="note-icon-pencil"/>',
					removeEmpty: false,
					disableUpload: false
				},
				callbacks: {
					onChange: contents => handleChange(handleFontCase(uppercase, contents))
				},
				toolbar: [
					['style', ['style']],
					['font', ['bold', 'underline', 'clear']],
					['fontname', ['fontname']],
					['fontsize', ['fontsize']],
					['color', ['color']],
					['para', ['ul', 'ol', 'paragraph']],
					['table', ['table']],
					['insert', ['link', 'picture', 'hr']],
					['view', ['fullscreen', 'help', 'codeview']]
				],
				fontNames: ['Arial', 'Helvetica', 'Courier New', 'Open Sans'],
				fontSizes: ['10', '11', '12', '13', '14']
			});

			if (uppercase) {
				const editable = this.editors[id].parent().find('.note-editable')[0];
				editable.setAttribute('style', 'text-transform: uppercase;');
			}

			this.editors[id].on('summernote.blur', e => {
				onChange(id, handleFontCase(uppercase, this.editors[id].summernote('code')));
				this.setState({ isFocused: false });
			});

			this.editors[id].on('summernote.focus', e => {
				this.setState({ isFocused: true });
			});
		}
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		// Set initial localValue
		if (nextProps.value && !prevState.localValue) {
			return { ...prevState, localValue: nextProps.value };
		}

		if (typeof nextProps.value === 'undefined' && prevState.localValue != '' && nextProps.richText) {
			return { ...prevState.initialState };
		}

		// Resets equivalent value
		if (prevState.localValue !== nextProps.value) {
			// For Add
			if (typeof nextProps.value === 'undefined' && !prevState.hasChange && !prevState.isFocused) {
				return { ...prevState.initialState };
			}

			// For Edit
			if (!prevState.isFocused) {
				return { ...prevState.initialState, localValue: nextProps.value };
			}
		}

		return null;
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.localValue !== this.state.localValue) {
			const { disabled = false, id, richText = false, uppercase = false } = prevProps;

			if (richText) {
				if (this.editors[id]) {
					this.editors[id].summernote(disabled ? 'disable' : 'enable');
					if (typeof this.state.localValue == 'string') {
						const editable = this.editors[id].parent().find('.note-editable');
						const prevContent = editable.html();

						if (prevContent != this.state.localValue) {
							if (uppercase) {
								editable.html(this.state.localValue.toUpperCase());
							} else {
								editable.html(this.state.localValue);
							}
						}
					}
				}
			}
		}
	}

	componentWillUnmount() {
		const { id, richText = false } = this.props;
		if (richText) {
			$(`.summernote-${id}`).summernote('destroy');
		}
	}

	renderInputText() {
		const {
			disabled = false,
			format = [],
			id,
			label = '',
			onChange,
			placeholder = '',
			required = false,
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
					class="form-control"
					disabled={disabled}
					name={id}
					options={{ delimiters, blocks }}
					placeholder={placeholder || label || id}
					required={required}
					style={newStyles}
					onChange={e => {
						this.handleChange(this.handleFontCase(uppercase, e.target.rawValue));
					}}
					onBlur={e => {
						onChange(id, this.handleFontCase(uppercase, this.state.localValue));

						this.setState({ isFocused: false });
					}}
					onFocus={e => {
						this.setState({ isFocused: true });
					}}
					onKeyPress={e => {
						if (e.key === 'Enter') {
							onChange(id, this.handleFontCase(uppercase, e.target.rawValue));
							return true;
						}
					}}
					value={this.handleFontCase(uppercase, this.state.localValue) || ''}
				/>
			);
		}

		return (
			<Input
				type="text"
				name={id}
				allowClear
				autoComplete="off"
				disabled={disabled}
				placeholder={placeholder || label || id}
				required={required}
				size="large"
				style={styles}
				onBlur={e => {
					if (e.target.value != value) onChange(id, this.handleFontCase(uppercase, e.target.value));

					this.setState({ isFocused: false });
				}}
				onChange={e => {
					if (e.target.value == '' && this.state.localValue.length != '' && !this.isFocused)
						onChange(id, this.handleFontCase(uppercase, e.target.value));

					this.handleChange(this.handleFontCase(uppercase, e.target.value));
				}}
				onFocus={e => {
					this.setState({ isFocused: true });
				}}
				onPressEnter={e => {
					onChange(id, this.handleFontCase(uppercase, e.target.value));
					return true;
				}}
				value={this.handleFontCase(uppercase, this.state.localValue)}
			/>
		);
	}

	renderTextArea() {
		const {
			disabled = false,
			id,
			label = '',
			onChange,
			placeholder = '',
			required = false,
			styles = {},
			uppercase = false,
			value = ''
		} = this.props;

		let newStyles = { ...styles };
		if (uppercase) {
			newStyles = { ...newStyles, textTransform: 'uppercase' };
		}

		return (
			<TextArea
				autoComplete="off"
				autosize={{ minRows: 2, maxRows: 6 }}
				disabled={disabled}
				name={id}
				placeholder={placeholder || label || id}
				required={required}
				style={newStyles}
				onBlur={e => {
					if (e.target.value != value) onChange(id, this.handleFontCase(uppercase, e.target.value));

					this.setState({ isFocused: false });
				}}
				onChange={e => {
					if (e.target.value == '' && this.state.localValue.length != '')
						onChange(id, this.handleFontCase(uppercase, e.target.value));

					this.handleChange(this.handleFontCase(uppercase, e.target.value));
				}}
				onFocus={e => {
					this.setState({ isFocused: true });
				}}
				onPressEnter={e => {
					onChange(id, this.handleFontCase(uppercase, e.target.value));
					return true;
				}}
				value={this.handleFontCase(uppercase, this.state.localValue) || ''}
			/>
		);
	}

	renderRichText() {
		const { id } = this.props;
		return <div class={`summernote-${id}`} dangerouslySetInnerHTML={{ __html: this.state.localValue || '' }} />;
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
		const { hasChange } = this.state;
		const {
			id,
			label = '',
			multiple,
			required = false,
			richText = false,
			withLabel = false,
			historyTrack = false
		} = this.props;

		if (withLabel) {
			if (historyTrack) {
				return (
					<div className="form-group">
						<span class="float-left">
							<label for={id}>{required ? `*${label}` : label}</label>
						</span>
						{hasChange && this.renderPopover()}
						{multiple ? (richText ? this.renderRichText() : this.renderTextArea()) : this.renderInputText()}
					</div>
				);
			} else {
				return (
					<div className="form-group">
						<label for={id}>{required ? `*${label}` : label}</label>
						{multiple ? (richText ? this.renderRichText() : this.renderTextArea()) : this.renderInputText()}
					</div>
				);
			}
		} else {
			if (historyTrack) {
				return (
					<div className="form-group">
						{hasChange && this.renderPopover()}
						{multiple ? (richText ? this.renderRichText() : this.renderTextArea()) : this.renderInputText()}
					</div>
				);
			} else {
				return (
					<Fragment>
						{multiple ? (richText ? this.renderRichText() : this.renderTextArea()) : this.renderInputText()}
					</Fragment>
				);
			}
		}

		return null;
	}
}
