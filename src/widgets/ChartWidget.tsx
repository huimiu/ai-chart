import "../styles/ChartWidget.css";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CopilotProvider,
  LatencyCancel,
  LatencyLoader,
  LatencyWrapper,
  useCopilotMode,
} from "@fluentai/react-copilot";

import { Textarea } from "@fluentai/react-copilot";
import { BaseWidget } from "@microsoft/teamsfx-react";

import { aiPower, queryDB } from "../services/chartService";

interface ChartWidgetState {
  onloading: boolean;
  data?: any[];
  xKey?: string;
  yKey?: string;
  questionValue?: string;
  sqlString?: string;
}

export default class ChartWidget extends BaseWidget<any, ChartWidgetState> {
  override async getData(): Promise<ChartWidgetState> {
    return {
      ...(await queryDB()),
      onloading: false,
    };
  }

  override body() {
    const showChart =
      this.state.data &&
      this.state.xKey &&
      this.state.yKey &&
      !this.state.onloading;
    return (
      <div className="chart-content">
        <Textarea
          placeholder="Describe the data you want to see"
          value={this.state.questionValue}
          onSubmit={(_ev, data) => {
            this.askAI(data.value);
          }}
        />
        {showChart ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={this.state.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={this.state.xKey!} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={this.state.yKey!} fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            {this.state.sqlString && (
              <pre>
                <code>{this.state.sqlString}</code>
              </pre>
            )}
          </>
        ) : (
          <CopilotProvider>
            <LatencyWrapper>
              <LatencyLoader header={"Generating chart"} />
            </LatencyWrapper>
          </CopilotProvider>
        )}
      </div>
    );
  }

  private async askAI(question: string) {
    try {
      if (question) {
        this.setState({
          onloading: true,
          data: [],
          xKey: undefined,
          yKey: undefined,
        });
        const resp = await aiPower(question);
        this.setState({
          ...resp,
          onloading: false,
          questionValue: "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ onloading: false });
    }
  }
}
