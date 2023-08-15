import "../styles/MyDashboard.css";

import { Button, Input } from "@fluentui/react-components";
import { BaseDashboard } from "@microsoft/teamsfx-react";

import { Send20Regular } from "@fluentui/react-icons";
import { generate } from "../services/generate";
import { queryDB } from "../services/sqlQuery";
import ChartWidget from "../widgets/ChartWidget";

export default class MyDashboard extends BaseDashboard<any, any> {
  override layout(): JSX.Element | undefined {
    return (
      <>
        <div className="ask-style">
          <div>
            <Input
              root="ask-input"
              size="large"
              placeholder="Describe the requirements for generating widget"
              value={this.state.inputValue}
              onChange={(e) => this.setState({ inputValue: e.target.value })}
            />
            <Button
              onClick={() => this.queryDB()}
              size="large"
              icon={<Send20Regular />}
              title="Generate"
            />
          </div>
        </div>
        <ChartWidget />
      </>
    );
  }

  override styling(): string {
    return this.state.isMobile === true ? "dashboard-mobile" : "dashboard";
  }

  private async askAI() {
    try {
      if (this.state.inputValue) {
        this.setState({ onloading: true, codeContents: [] });
        const resp = await generate(this.state.inputValue);
        this.setState({
          codeContents: resp,
          onloading: false,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ onloading: false });
    }
  }

  private async queryDB() {
    await queryDB();
  }
}
