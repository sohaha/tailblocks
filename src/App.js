import React, { Component } from 'react';
import Frame from 'react-frame-component';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015, docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import cn from 'classnames';
import { beautifyHTML } from './utils';

import getBlock from './components/blocks';
import getIcons, {
  desktopIcon,
  tabletIcon,
  phoneIcon,
  clipboardIcon,
} from "./components/icons";

const tailwindVersion = '2.2.4';
const themeList = [
  "indigo",
  "yellow",
  "red",
  "purple",
  "pink",
  "blue",
  "green",
];
const viewList = [
  {
    icon: desktopIcon,
    name: "desktop",
  },
  {
    icon: tabletIcon,
    name: "tablet",
  },
  {
    icon: phoneIcon,
    name: "phone",
  },
];
const iconList = getIcons();
const blockList = [];

Object.entries(iconList).forEach(
  ([type, icons]) => {
    Object.keys(icons).map((name) =>  blockList.push(`${name},${type}`));
  }
);
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      darkMode: false,
      copied: false,
      sidebar: true,
      codeView: false,
      currentKeyCode: null,
      controlKeyCode: null,
      view: "desktop",
      theme: "indigo",
      blockType: "Blog",
      blockName: "BlogA",
      markup: "",
    };

    this.changeMode = this.changeMode.bind(this);
    this.changeTheme = this.changeTheme.bind(this);
    this.changeBlock = this.changeBlock.bind(this);
    this.prevTheme = this.prevTheme.bind(this);
    this.nextTheme = this.nextTheme.bind(this);
    this.handleContentDidMount = this.handleContentDidMount.bind(this);
    this.changeView = this.changeView.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.toggleView = this.toggleView.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.markupRef = React.createRef();
    this.textareaRef = React.createRef();
    this.sidebarRef = React.createRef();
    this.openerRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener("keyup", this.handleKeyUp);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  hideSidebar() {
    const sidebar = this.sidebarRef.current;
    const opener = this.openerRef.current;

    document.addEventListener("click", (e) => {
      if (e.target === opener) {
        return;
      }

      if (!e.target === sidebar || !sidebar.contains(e.target)) {
        this.setState({ sidebar: false });
      }
    });
  }

  handleKeyUp(e) {
    const keyCode = e.which || e.keyCode;
    const validKeyCodes = [8, 9, 13, 17, 67, 88, 91, 93, 32, 37, 38, 39, 40, 188];
    // debounce
    setTimeout(
      () =>
        validKeyCodes.includes(keyCode) &&
        this.setState({ currentKeyCode: null, controlKeyCode: null }),
      200
    );
  }

  handleKeyDown(e) {
    const { blockType, blockName } = this.state;
    const blockStringFormat = `${blockName},${blockType}`;
    const keyCode = e.which || e.keyCode;
    const validKeyCodes = [8, 9, 13, 17, 67, 88, 91, 93, 32, 37, 38, 39, 40, 188];

    switch (keyCode) {
      case 9:
        // tab = change view (desktop/tablet/device)
        e.preventDefault();
        this.setState({
          currentKeyCode: 9,
        });
        break;
      case 32:
        // space = toggle codeView
        e.preventDefault();
        this.setState({
          codeView: !this.state.codeView,
          currentKeyCode: 32,
        });
        break;
      case 17: case 91: case 93:
        // command (L), command (R), ctrl
        e.preventDefault();
        this.setState({
          currentKeyCode: keyCode,
          controlKeyCode: keyCode,
        });
        break;
      case 88: case 67:
        // X/C + Cmd/Ctrl = Copy to Clipboard
        e.preventDefault();
        if ([17, 91, 93].includes(this.state.controlKeyCode)) {
          this.copyToClipboard();
        }
        this.setState({
          currentKeyCode: keyCode,
        });
        break;
      case 188:
        // comma + ctrl = toggle sidebar
        e.preventDefault();
        if ([17, 91, 93].includes(this.state.controlKeyCode)) {
          this.setState({
            currentKeyCode: 188,
            sidebar: !this.state.sidebar,
          });
        }
        this.setState({
          currentKeyCode: keyCode,
        });
        break;
      case 37:
        // Left = Previous Theme
        e.preventDefault();
        this.prevTheme();
        this.setState({
          currentKeyCode: 37,
        });
        break;
      case 39:
        // Right = Next Theme
        e.preventDefault();
        this.nextTheme();
        this.setState({
          currentKeyCode: 39,
        });
        break;
      case 38: case 8:
        // Up, Delete/Backspace = Previous Block
        e.preventDefault();
        blockList.forEach((block, index) => {
          if (block === blockStringFormat) {
            const newActiveBlock =
              index - 1 >= 0
                ? blockList[index - 1].split(",").map((b) => b.trim())
                : blockList[blockList.length - 1]
                    .split(",")
                    .map((b) => b.trim());
            const [newBlockName, newBlockType] = newActiveBlock;
            const newBlockNode = document.querySelector(
              `.block-item[block-name="${newBlockName}"]`
            );
            newBlockNode && newBlockNode.focus();

            this.setState({
              blockType: newBlockType,
              blockName: newBlockName,
              codeView: false,
              currentKeyCode: keyCode,
            });
          }
        });
        break;
      case 40: case 13: // Down, Enter = Next Block
        e.preventDefault();
        blockList.forEach((block, index) => {
          if (block === blockStringFormat) {
            const newActiveBlock =
              index + 1 <= blockList.length - 1
                ? blockList[index + 1].split(",")
                : blockList[0].split(",");
            const [newBlockName, newBlockType] = newActiveBlock;

            const newBlockNode = document.querySelector(
              `.block-item[block-name="${newBlockName}"]`
            );
            newBlockNode && newBlockNode.focus();

            this.setState({
              blockType: newBlockType,
              blockName: newBlockName,
              codeView: false,
              currentKeyCode: keyCode,
            });
          }
        });
        break;
      default:
        return;
    }
    // debounce
    setTimeout(
      () =>
        validKeyCodes.includes(keyCode) &&
        this.setState({ currentKeyCode: null }),
      250
    );
  }

  changeMode() {
    this.setState({ darkMode: !this.state.darkMode });
  }

  handleContentDidMount() {
    const iframe = document.querySelector("iframe");
    iframe.contentWindow.document.addEventListener("keyup", (e) => this.handleKeyUp(e));
    iframe.contentWindow.document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    iframe.contentWindow.document.addEventListener("click", () => this.setState({ sidebar: false }));

    setTimeout(() => {
      this.setState({
        ready: true,
        markup: this.markupRef.current.innerHTML,
      });
    }, 400);
  }

  changeBlock(e) {
    const { currentTarget } = e;
    const blockType = currentTarget.getAttribute("block-type");
    const blockName = currentTarget.getAttribute("block-name");
    this.setState({
      blockType,
      blockName,
      codeView: false,
    });
  }

  changeTheme(e) {
    const { currentTarget } = e;
    const theme = currentTarget.getAttribute("data-theme");
    this.setState({ theme });
  }

  nextTheme() {
    const { theme } = this.state;
    const themeIndex = themeList.findIndex((t) => t === theme);
    this.setState({ theme: themeList[themeIndex + 1] });
  }

  prevTheme() {
    const { theme } = this.state;
    const themeIndex = themeList.findIndex((t) => t === theme);
    this.setState({ theme: themeList[themeIndex - 1] });
  }

  changeView(e) {
    const { currentTarget } = e;
    const view = currentTarget.getAttribute("data-view");
    this.setState({
      view,
      codeView: false,
    });
  }

  toggleView() {
    this.setState({
      view: "desktop",
      codeView: !this.state.codeView,
      markup: this.markupRef.current.innerHTML,
    });
  }

  themeListRenderer() {
    const { theme } = this.state;
    return themeList.map((t, k) => {
      return (
        <button
          key={k}
          data-theme={t}
          className={cn(
            "theme-button",
            `bg-${t}-500`,
            theme === t ? " is-active" : null
          )}
          onClick={this.changeTheme}
          onKeyUp={this.handleKeyUp}
          onKeyDown={this.handleKeyDown}
        />
      );
    });
  }

  listRenderer() {
    const { blockName } = this.state;
    return Object.entries(iconList).map(([type, icons]) => (
      <div className="blocks" key={type}>
        <div className="block-category">{type}</div>
        <div className="block-list">
          {Object.entries(icons).map(([key, value]) => (
            <button
              tabIndex="0"
              onClick={this.changeBlock}
              className={cn(
                "block-item",
                key === blockName ? " is-active" : null
              )}
              block-type={type}
              block-name={key}
              key={key}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    ));
  }

  viewModeRenderer() {
    const { view } = this.state;
    return viewList.map((v, k) => (
      <button
        key={k}
        className={cn("device", view === v.name ? " is-active" : null)}
        data-view={v.name}
        onClick={this.changeView}
      >
        {v.icon}
      </button>
    ));
  }

  toggleSidebar() {
    this.setState({ sidebar: !this.state.sidebar });
  }

  copyToClipboard() {
    const code = beautifyHTML(this.state.markup);
    var input = document.createElement("textarea");
    input.innerHTML = code;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({
        copied: false,
      });
    }, 2000);
  }

  render() {
    const {
      theme,
      darkMode,
      blockName,
      blockType,
      sidebar,
      view,
      copied,
      currentKeyCode,
    } = this.state;
    return (
      <div
        className={`app${darkMode ? " dark-mode" : ""}${
          sidebar ? " has-sidebar" : ""
        } ${theme} ${view}`}
      >
        <textarea className="copy-textarea" ref={this.textareaRef} />
        <aside className="sidebar" ref={this.sidebarRef}>
          {this.listRenderer()}
        </aside>
        <div className="toolbar">
          <button
            className="opener"
            onClick={this.toggleSidebar}
            ref={this.openerRef}
          >
            Tailblocks
          </button>
          {this.state.codeView && (
            <div className="clipboard-wrapper">
              <button
                className="copy-the-block copy-to-clipboard"
                onClick={this.copyToClipboard}
              >
                {clipboardIcon}
                <span>Copy to Clipboard</span>
              </button>
              <span
                className={cn("clipboard-tooltip", copied && " is-copied ")}
              >
                Copied!
              </span>
            </div>
          )}
          <button className="copy-the-block" onClick={this.toggleView}>
            {!this.state.codeView ? (
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M16 18L22 12 16 6"></path>
                <path d="M8 6L2 12 8 18"></path>
              </svg>
            ) : (
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="css-i6dzq1"
                viewBox="0 0 24 24"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
            <span>{!this.state.codeView ? "VIEW CODE" : "PREVIEW"}</span>
          </button>
          <div className="switcher">{this.themeListRenderer()}</div>
          {this.viewModeRenderer()}
          <button className="mode" onClick={this.changeMode}></button>
        </div>
        <div className="markup" ref={this.markupRef}>
          {getBlock({ theme, darkMode })[blockType][blockName]}
        </div>
        <main
          className="main"
          style={{ opacity: this.state.ready ? "1" : "0" }}
        >
          <div className={cn("view", this.state.codeView ? " show-code" : "")}>
            <Frame
              contentDidMount={this.handleContentDidMount}
              contentDidUpdate={this.handleContentDidUpdate}
              head={
                <>
                  <link
                    href={`https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/${tailwindVersion}/tailwind.min.css`}
                    rel="stylesheet"
                  />
                  {
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `img { filter:
                      ${
                        darkMode
                          ? "invert(1) opacity(.5); mix-blend-mode: luminosity; }"
                          : "sepia(1) hue-rotate(190deg) opacity(.46) grayscale(.7) }"
                      }`,
                      }}
                    />
                  }
                </>
              }
            >
              {getBlock({ theme, darkMode })[blockType][blockName]}
            </Frame>
            <div className="codes">
              <SyntaxHighlighter
                language="html"
                style={darkMode ? vs2015 : docco}
                showLineNumbers
              >
                {beautifyHTML(this.state.markup)}
              </SyntaxHighlighter>
            </div>
          </div>
        </main>
        <a
          href="https://github.com/nberlette/tailblocks"
          className="github"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"
            />
          </svg>
          GitHub
        </a>
        <div className="keyboard-nav">
          <div
            className={`k-up keyboard-button${
              currentKeyCode === 38 || currentKeyCode === 8 ? " is-active" : ""
            }`}
            data-info="Previous Block"
          >
            <svg
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
          <div className="keyboard-nav-row">
            <div
              className={`k-left keyboard-button${
                currentKeyCode === 37 ? " is-active" : ""
              }`}
              data-info="Previous Theme"
            >
              <svg
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <div
              className={`k-down keyboard-button${
                currentKeyCode === 40 || currentKeyCode === 13 ? " is-active" : ""
              }`}
              data-info="Next Block"
            >
              <svg
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
            <div
              className={`k-right keyboard-button${
                currentKeyCode === 39 ? " is-active" : ""
              }`}
              data-info="Next Theme"
            >
              <svg
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
