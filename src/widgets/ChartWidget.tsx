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

import { getData } from "../services/chartService";
import { queryDB } from "../services/sqlQuery";

interface ChartWidgetState {
  data: any[];
}

export default class ChartWidget extends BaseWidget<any, ChartWidgetState> {
  override async getData(): Promise<ChartWidgetState> {
    return {
      data: await queryDB(),
    };
  }
  override body() {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={this.state.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ProductId" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="SaleCount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
