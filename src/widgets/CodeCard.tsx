import "highlight.js/styles/github.css";
import "../styles/CodeCard.css";

import hljs from "highlight.js";

import {
  Button,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Text,
  ToggleButton,
} from "@fluentui/react-components";
import { ArrowDownload24Regular, Code24Regular, Copy24Regular } from "@fluentui/react-icons";
import { BaseWidget, IWidgetClassNames } from "@microsoft/teamsfx-react";

export class CodeCard extends BaseWidget<any, any> {
  override header() {
    return (
      <div>
        <Code24Regular />
        <Text>{this.props.content.name}</Text>
        <div>
          <Popover size="small" closeOnScroll={true}>
            <PopoverTrigger>
              <ToggleButton
                icon={<Copy24Regular />}
                appearance="transparent"
                onClick={() => this.fallbackCopyTextToClipboard(this.props.content.code)}
              />
            </PopoverTrigger>
            <PopoverSurface>
              <div>Copied</div>
            </PopoverSurface>
          </Popover>
          <Button icon={<ArrowDownload24Regular />} appearance="transparent" />
        </div>
      </div>
    );
  }

  override body() {
    return (
      <pre>
        <code>{this.props.content.code}</code>
      </pre>
    );
  }

  override styling(): IWidgetClassNames {
    return { root: "code-card-root", body: "code-card-body" };
  }

  async componentDidMount() {
    this.updateCodeSyntaxHighlighting();
  }

  componentDidUpdate() {
    this.updateCodeSyntaxHighlighting();
  }

  updateCodeSyntaxHighlighting = () => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block as HTMLElement);
    });
  };

  fallbackCopyTextToClipboard(text: string) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (err) {}

    document.body.removeChild(textArea);
  }
}
