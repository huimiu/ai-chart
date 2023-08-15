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
import { queryDB } from "../services/sqlQuery";

interface ChartWidgetState {
  data: any[];
  onloading: boolean;
  inputValue?: string;
  xKey: string;
  yKey: string;
}

export default class ChartWidget extends BaseWidget<any, ChartWidgetState> {
  override async getData(): Promise<ChartWidgetState> {
    return {
      data: [],
      onloading: false,
      xKey: "ProductId",
      yKey: "SaleCount",
    };
  }
  override body() {
    return (
      <div>
        <div>
          <Input
            root="ask-input"
            size="large"
            placeholder="Describe the requirements for generating widget"
            value={this.state.inputValue}
            onChange={(e) => this.setState({ inputValue: e.target.value })}
          />
          <Button
            onClick={() => {
              this.askAI();
            }}
            size="large"
            icon={<Send20Regular />}
            title="Generate"
          />
        </div>

        {this.state.data && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={this.state.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={this.state.xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={this.state.yKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  private async askAI() {
    try {
      this.setState({ onloading: true, data: [] });
      const resp = await queryDB(this.state.inputValue);
      this.setState({
        data: resp.data,
        onloading: false,
        xKey: resp.x,
        yKey: resp.y,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ onloading: false });
    }
  }
}
