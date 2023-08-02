import { AdminLayout } from "@layout";
import {
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import ShuffleText from "shuffle-text";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement,
  BarElement,
  Filler,
  ChartOptions,
} from "chart.js";
import { useState, useEffect, useRef } from "react";
import { apiFetchCtr } from "src/libs/dbUtils";
import { Bar } from "react-chartjs-2";
import { Toastify } from "src/libs/allToasts";
import { ILocationSettings } from "@models/common-model";
import { Switch } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip
);

const data22 = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      data: [300, 50, 100],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
    },
  ],
};

const Home = (probs: any) => {
  const { shopId } = probs;
  const [facrtors, setFacrtors] = useState([]);
  const [upDown, setUpDown] = useState(false);
  const [topProdcuts, setTopProdcuts] = useState({ labels: [], values: [] });
  const [topProdcutsDown, setTopProdcutsDown] = useState({
    labels: [],
    values: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [txtP1, setTxtP1] = useState({ name: "", index: 1 });
  const [txtP2, setTxtP2] = useState({ name: "", index: 1 });
  const [txtP3, setTxtP3] = useState({ name: "", index: 1 });
  const [txtP4, setTxtP4] = useState({ name: "", index: 1 });
  const [profitMonthLabels, setProfitMonthLabels] = useState([]);
  const [profitMonthValues, setProfitMonthValues] = useState([]);
  const [box1Price, setBox1Price] = useState([1, 2, 3, 4]);
  const [box2Price, setBox2Price] = useState([1, 2, 3, 4]);
  const [box3Price, setBox3Price] = useState([1, 2, 3, 4]);
  const [box4Price, setBox4Price] = useState([1, 2, 3, 4]);
  const title1 = useRef(null);
  const title2 = useRef(null);
  const title3 = useRef(null);
  const title4 = useRef(null);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    value: 0,
    label: "",
    currency_decimal_places: 0,
    currency_code: "",
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: "",
  });

  async function initData() {
    const { success, data } = await apiFetchCtr({
      fetch: "dashboard",
      subType: "initDash",
      shopId,
    });
    if (!success) {
      Toastify("error", "Error in loading, Try Again");
      return;
    }
    setIsLoading(false);
    setProfitMonthLabels(data.months_name);
    setProfitMonthValues(data.profit_months);
    setFacrtors(data.factors_lsit);
    setBox1Price(data.profit_sales);
    setBox2Price(data.profit_expense);
    setBox3Price(data.purchases);
    setBox4Price(data.count_contacts);
    if (data.upPro != null && data.upPro.length > 0)
      setTopProdcuts({
        labels: data.upPro.map((item: any) => item.name),
        values: data.upPro.map((item: any) => item.total_qty_sold),
      });
    else
      setTopProdcuts({
        labels: [0, 0, 0, 0, 0, 0, 0],
        values: [0, 0, 0, 0, 0, 0, 0],
      });
    if (data.downPro != null && data.downPro.length > 0)
      setTopProdcutsDown({
        labels: data.downPro.map((item: any) => item.name),
        values: data.downPro.map((item: any) => item.total_qty_sold),
      });
    else
      setTopProdcutsDown({
        labels: [0, 0, 0, 0, 0, 0, 0],
        values: [0, 0, 0, 0, 0, 0, 0],
      });
  }
  useEffect(() => {
    initData();
    var _locs = JSON.parse(localStorage.getItem("userlocs") || "[]");
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else alert("errorr location settings");

    setTxtP1({ name: getTxtTimeFrame(1), index: 1 });
    setTxtP2({ name: getTxtTimeFrame(1), index: 1 });
    setTxtP3({ name: getTxtTimeFrame(1), index: 1 });
    setTxtP4({ name: getTxtTimeFrame(1), index: 1 });
  }, []);
  function getTxtTimeFrame(p: number) {
    if (p == 1) return "Daily";
    else if (p == 2) return "Weekly";
    else if (p == 3) return "Monthly";
    else if (p == 4) return "Yearly";
    else return "err";
  }
  function getRightNum(p: number) {
    if (p > 4) p = 1;
    else if (p < 1) p = 4;
    return p;
  }
  const btnHandleTimeFrame = (index: number, p: number) => {
    index = getRightNum(index);
    if (p == 1) setTxtP1({ name: getTxtTimeFrame(index), index: index });
    else if (p == 2) setTxtP2({ name: getTxtTimeFrame(index), index: index });
    else if (p == 3) setTxtP3({ name: getTxtTimeFrame(index), index: index });
    else if (p == 4) setTxtP4({ name: getTxtTimeFrame(index), index: index });
  };
  useEffect(() => {
    const text = new ShuffleText(title1.current);
    text.start();
  }, [txtP1]);
  useEffect(() => {
    const text = new ShuffleText(title2.current);
    text.start();
  }, [txtP2]);
  useEffect(() => {
    const text = new ShuffleText(title3.current);
    text.start();
  }, [txtP3]);
  useEffect(() => {
    const text = new ShuffleText(title4.current);
    text.start();
  }, [txtP4]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chart.js Bar Chart",
      },
    },
  };
  const handleUpDown = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpDown(event.target.checked);
  };
  function getRightTime(dateTimeString: string) {
    return moment(dateTimeString).format("YYYY/MM/DD hh:mm A");
  }

  // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data_bar = {
    labels: profitMonthLabels,
    datasets: [
      {
        label: "Monthly Sales",
        data: profitMonthValues,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const data_last_low = {
    labels: upDown ? topProdcutsDown.labels : topProdcuts.labels,
    datasets: [
      {
        label: "TOP/Down Products",
        data: upDown ? topProdcutsDown.values : topProdcuts.values,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout shopId={shopId}>
      <div className="row loc-dash-top" style={{ background: "#f6f8fa" }}>
        <div className="loc-dash-top-items">
          <div className="inner-loc-dash-top-items">
            <div className="top-cricle-dash">
              <img src="/images/dashboard/sales_icon.png" />
            </div>
          </div>
          <div className="inner-loc-dash-top-items dash-top-items-details">
            <h4>SALES</h4>
            <h5 ref={title1}>{txtP1.name}</h5>
            <h3>
              {Number(box1Price[txtP1.index - 1]).toFixed(
                locationSettings?.currency_decimal_places
              )}
              <span>{locationSettings?.currency_code}</span>
            </h3>
          </div>
          <div className="inner-loc-dash-top-items arrows-details">
            <div
              className="arrow-updown"
              onClick={() => btnHandleTimeFrame(txtP1.index + 1, 1)}
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div
              className="arrow-updown"
              onClick={() => btnHandleTimeFrame(txtP1.index - 1, 1)}
            >
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
        </div>

        <div className="loc-dash-top-items">
          <div className="inner-loc-dash-top-items">
            <div className="top-cricle-dash">
              <img src="/images/dashboard/purchase_icon.png" />
            </div>
          </div>
          <div className="inner-loc-dash-top-items dash-top-items-details">
            <h4>PURCHASES</h4>
            <h5 ref={title3}>{txtP3.name}</h5>
            <h3>
              {Number(box3Price[txtP3.index - 1]).toFixed(
                locationSettings?.currency_decimal_places
              )}
              <span>{locationSettings?.currency_code}</span>
            </h3>
          </div>
          <div className="inner-loc-dash-top-items arrows-details">
            <div
              className="arrow-updown"
              onClick={() => btnHandleTimeFrame(txtP3.index + 1, 3)}
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div
              className="arrow-updown"
              onClick={() => btnHandleTimeFrame(txtP3.index - 1, 3)}
            >
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
        </div>

        <div className="loc-dash-top-items">
          <div className="inner-loc-dash-top-items">
            <div className="top-cricle-dash">
              <img src="/images/dashboard/cash.png" />
            </div>
          </div>
          <div className="inner-loc-dash-top-items dash-top-items-details">
            <h4>EXPENSES</h4>
            <h5 ref={title2}>{txtP2.name}</h5>
            <h3>
              {Number(box2Price[txtP2.index - 1]).toFixed(
                locationSettings?.currency_decimal_places
              )}
              <span>{locationSettings?.currency_code}</span>
            </h3>
          </div>
          <div className="inner-loc-dash-top-items arrows-details">
            <div
              className="arrow-updown"
              onClick={() => btnHandleTimeFrame(txtP2.index + 1, 2)}
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div
              className="arrow-updown"
              onClick={() => btnHandleTimeFrame(txtP2.index - 1, 2)}
            >
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
        </div>

        <div className="loc-dash-top-items">
          <div className="inner-loc-dash-top-items">
            <div className="top-cricle-dash">
              <img src="/images/dashboard/users_icon.jpg" />
            </div>
          </div>
          <div className="inner-loc-dash-top-items dash-top-items-details">
            <h4>CUSTOMERS</h4>
            <h5 ref={title4}>{txtP4.name}</h5>
            <h3>
              {Number(box4Price[txtP4.index - 1])}
              <span></span>
            </h3>
          </div>
          <div className="inner-loc-dash-top-items arrows-details">
            <div
              className="arrow-updown"
              onClick={() => btnHandleTimeFrame(txtP4.index + 1, 4)}
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div
              className="arrow-updown"
              onClick={() => btnHandleTimeFrame(txtP4.index - 1, 4)}
            >
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
        </div>
      </div>
      <div className="row loc-dash-top-under">
        <div className="loc-dash-big-chart">
          <h4>Monthly Sales</h4>
          <div>
            <Bar
              data={data_bar}
              width={400}
              height={200}
              options={{
                maintainAspectRatio: false,
                indexAxis: "y",
              }}
            />
          </div>
        </div>
        <div className="loc-dash-small-chart">
          <h4>
            Top 7 Products <Switch checked={upDown} onChange={handleUpDown} />
            <span>{upDown ? "Down" : "Up"}</span>
          </h4>
          <div>
            <Bar
              data={data_last_low}
              width={400}
              height={200}
              options={{
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
      <div className="row loc-dash-top-under">
        <div className="">
          <div className="loc-dasg-box">
            <h4>The last 10 invoices</h4>
            <div className="loc-dasg-box-content">
              <div className="me-head-table">
                <div className="m-fileds">#</div>
                {/* <div className="m-fileds">Date</div> */}
                <div className="m-fileds">final Total</div>
                <div className="m-fileds">Created By</div>
              </div>
              {facrtors.map((itm, i: number) => {
                return (
                  <div key={i} className="me-tr-table">
                    <div className="m-fileds">{itm.id}</div>
                    <div className="m-fileds">
                      {getRightTime(itm.created_at)}
                    </div>
                    <div className="m-fileds">
                      {Number(itm.total_price).toFixed(
                        locationSettings.currency_decimal_places
                      )}{" "}
                      {locationSettings.currency_code}
                    </div>
                    <div className="m-fileds">{itm.created_by}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default Home;
export async function getServerSideProps(context: any) {
  if (context.query.id == undefined)
    return {
      redirect: {
        permanent: false,
        destination: "/page403",
      },
    };
  return {
    props: { shopId: context.query.id },
  };
}
