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

import { BaseWidget } from "@microsoft/teamsfx-react";

import { Button, Input } from "@fluentui/react-components";
import { Send20Regular } from "@fluentui/react-icons";
import { aiPower, queryDB } from "../services/chartService";
import { Textarea } from "@fluentai/react-copilot";

interface ChartWidgetState {
  onloading: boolean;
  data?: any[];
  xKey?: string;
  yKey?: string;
}

export default class ChartWidget extends BaseWidget<any, ChartWidgetState> {
  override async getData(): Promise<ChartWidgetState> {
    return {
      ...(await queryDB()),
      onloading: false,
    };
  }

  override body() {
    const showChart = this.state.data && this.state.xKey && this.state.yKey;
    return (
      <div>
        <div>
          <Textarea
            placeholder="Describe the data you want to see"
            onSubmit={(ev, data) => {
              this.askAI(data.value);
            }}
          />
        </div>

        {showChart && (
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
        )}
      </div>
    );
  }

  private async askAI(question: string) {
    try {
      if (question) {
        this.setState({ onloading: true, data: [] });
        const resp = await aiPower(question);
        this.setState({
          data: resp.data,
          onloading: false,
          xKey: resp.x,
          yKey: resp.y,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ onloading: false });
    }
  }
}
