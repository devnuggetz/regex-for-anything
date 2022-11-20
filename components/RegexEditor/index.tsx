import "draft-js/dist/Draft.css";
import React, { useEffect, useRef, useState } from "react";
import {
  CompositeDecorator,
  ContentBlock,
  ContentState,
  Editor,
  EditorState,
} from "draft-js";

import { copyToClipboard, setCaretPosition } from "../../utils/funcs";
import MatchedText from "./MatchedText";
import styles from "./regexEditor.module.css";
import Image from "next/image";
import { copyIcon } from "../../assets/icons/icons";
import Flags from "./Flags";

const TEXT = "My name is Shuvamk ";

const initialContent = ContentState.createFromText(TEXT);

const RegexEditor = () => {
  const [state, setState] = useState<State>({
    regex: "",
    flags: [],
    editorState: EditorState.createEmpty(),
  });

  useEffect(() => {
    const regex = "[A-Z]\\w+";
    const flags = ["g"];
    setState({
      regex,
      flags,
      editorState: checkRegex(
        regex,
        EditorState.createWithContent(initialContent)
      ),
    });

    setCaretPosition(regexInput?.current, state.regex.length);
  }, []);

  const regexInput = useRef<HTMLInputElement>(null);

  const editor = useRef(null);

  const handleRegexInput = (e: any) => {
    const regex = e?.currentTarget?.value || "";
    setState({
      ...state,
      regex,
      editorState: checkRegex(regex, state.editorState),
    });
  };

  const checkRegex = (regex: string | RegExp, editorState: EditorState) => {
    let rowIndex = 0;
    let matchCount = 0;

    if (!regex) {
      const content = editorState.getCurrentContent();
      return EditorState.createWithContent(content);
    }

    function findWithRegex(content: ContentBlock, callback: Function) {
      // const isMultiple = flags.includes("m");
      const isMultiple = true;
      // const isNeededMultiple = regex.startsWith("^") || regex.endsWith("$");
      const isNeededMultiple = true;

      if (!isMultiple && isNeededMultiple && rowIndex > 0) return;

      // const isGlobal = flags.includes("g");
      const isGlobal = true;

      if (!isGlobal && matchCount > 0) return;

      const text = content.getText();
      const currentRegex = new RegExp(regex, `g`);

      let matches = [...text.matchAll(currentRegex)];

      if (!isGlobal) {
        matches = matches.slice(0, 1);
      }

      if (regex && matches.length) {
        matches.forEach((match) =>
          callback(match?.index, match?.index! + match[0].length)
        );
      }

      if (matches.length) {
        matchCount++;
      }

      rowIndex++;
    }

    function handleStrategy(content: ContentBlock, callback: Function) {
      try {
        findWithRegex(content, callback);
      } catch (err) {}
    }

    const HighlightDecorator = new CompositeDecorator([
      {
        strategy: handleStrategy,
        component: MatchedText,
      },
    ]);

    return EditorState.createWithContent(
      editorState.getCurrentContent(),
      HighlightDecorator
    );
  };

  const onChangeContent = (editorState: EditorState) => {
    setState({ ...state, editorState });
  };

  const handleCopyToClipboard = () => {
    copyToClipboard(state.regex);
  };

  const handleFlagSelection = (flag: string) => {
    if (state.flags.indexOf(flag) > -1) {
      setState({
        ...state,
        flags: state.flags.filter((_flag) => _flag !== flag),
      });
    } else {
      setState({
        ...state,
        flags: [...state.flags, flag],
      });
    }

    console.log("hererere", [...state.flags, flag]);
  };

  return (
    <div className={styles.wrapper}>
      <div className={`flex`}>
        <div className={styles.textInputWrapper}>
          <div>/</div>
          <input
            value={state.regex}
            spellCheck={false}
            onInput={handleRegexInput}
            className={styles.textInput}
            ref={regexInput}
          />
          <div>/</div>
          <div>
            {state.flags.map((flag) => (
              <span key={flag}>{flag}</span>
            ))}
          </div>
        </div>
        <div
          className={`${styles.copyWrapper} absolute-center`}
          onClick={handleCopyToClipboard}
        >
          <Image src={copyIcon} alt="copy" height={16} />
        </div>
        <Flags flags={state.flags} handleFlagSelection={handleFlagSelection} />
      </div>

      <div
        className={`${styles.textWrapper}`}
        onClick={() =>
          setState({
            ...state,
            editorState: EditorState.moveSelectionToEnd(state.editorState),
          })
        }
      >
        <Editor
          ref={editor}
          editorState={state.editorState}
          onChange={onChangeContent}
        />
      </div>
    </div>
  );
};

type State = {
  regex: string;
  flags: string[];
  editorState: EditorState;
};

export default RegexEditor;
