'use strict';

import _ from 'lodash';
import React from "react";
import TransitionGroup from "react-addons-css-transition-group";
import ReactEmoji from "react-emoji";
import ReactAutolink from "react-autolink";
import ReactIpfsLink from "components/plugins/react-ipfs-link";
import MentionHighlighter from 'components/plugins/mention-highlighter';
import User from "components/User";
import moment from 'moment'
import "styles/TextMessage.scss";

class TextMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
      replyto: props.replyto,
      useEmojis: props.useEmojis,
      highlightWords: props.highlightWords,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      replyto: nextProps.replyto,
      useEmojis: nextProps.useEmojis,
      highlightWords: nextProps.highlightWords
    });
  }

  componentDidMount() {
    // Remove the command from rendering
    if(this.state.text.startsWith("/me")) {
      const text = this.state.text.substring(3, this.state.text.length);
      this.setState({ text: text });
    }
  }

  // Higlight specified words (ie. username)
  _highlight(items) {
    return _.flatten(items.map((item) => {
      return MentionHighlighter.highlight(item, this.state.highlightWords, { highlightClassName: 'highlight', key: Math.random() });
    }));
  }

  // Create emojis
  _emojify(items, size = '20px') {
    // size = _.flatten(items).length === 1 ? '32px' : size
    const emojiOpts = {
      emojiType: 'emojione',
      attributes: { width: size, height: size }
    };

    return _.flatten(items).map((item) => {
      if(typeof item !== 'string') return item;
      // console.log(item)
      // if(item.trim().charAt(0) !== ':' && item.trim().endsWith('d:')) return item; // Handle 'd:' as a special case
      emojiOpts.attributes.alt = item.trim();
      return ReactEmoji.emojify(item, emojiOpts);
    });
  }

  // Create linkss from IPFS hashes
  _ipfsfy(items) {
    return _.flatten(items.map((item) => {
      return (typeof item === 'string') ? ReactIpfsLink.linkify(item, { target: "_blank", rel: "nofollow", key: Math.random() }) : item;
    }));
  }

  render() {
    // Create links from urls
    let finalText = ReactAutolink.autolink(this.state.text, { target: "_blank", rel: "nofollow", key: Math.random() });
    finalText = this._highlight(finalText);
    // finalText = this._ipfsfy(finalText);
    finalText = this.state.useEmojis ? this._emojify(finalText) : finalText;

    if(this.state.replyto) {
      const content = this.state.replyto.post.content ? this.state.replyto.post.content : this.state.replyto.post.name

      let replyText = ReactAutolink.autolink(content, { target: "_blank", rel: "nofollow", key: Math.random() });
      replyText = this.state.useEmojis ? this._emojify([replyText], '12px') : content

      const element = (
        <div className="reply" key={Math.random()}>
          <span className="replyToIcon">↩︎</span>
          <div>
            <div className="row">
              <User
                user={this.state.replyto.user}
                colorify={true}
                highlight={false}
                onShowProfile={this.props.onShowProfile}
                />
              <span className="Timestamp">{moment(this.state.replyto.post.meta.ts).fromNow()}</span>
            </div>
            <div style={{ marginTop: "0.1em" }}>{replyText}</div>
          </div>
        </div>
      )
      finalText.push(element)
    }


    const content = (
      <TransitionGroup
        transitionName="textAnimation"
        transitionAppear={true}
        transitionAppearTimeout={1000}
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}
        className="content2">
        <span className="content2" key={"1"}>{finalText}</span>
      </TransitionGroup>
    );

    return (<div className="TextMessage">{content}</div>);
  }
}

export default TextMessage;
