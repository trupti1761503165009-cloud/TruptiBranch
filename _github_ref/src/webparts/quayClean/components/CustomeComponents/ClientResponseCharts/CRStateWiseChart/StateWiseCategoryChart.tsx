/* eslint-disable */
import * as React from "react";
import * as echarts from "echarts";
import { Label, PrimaryButton } from "@fluentui/react";
import { getStateColor } from "../../../CommonComponents/CommonMethods";
import { defaultBarColors } from "../../../../../../Common/Enum/HazardFields";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { topDataOptions } from "../../../../../../Common/Constants/CommonConstants";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";

interface Props {
  data: any[];
  width?: any;
  siteName?: any;
}

const StateWiseCategoryChart: React.FC<Props> = ({ data, width, siteName }) => {
  const chartRef = React.useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = React.useState<any>(null);

  const [level, setLevel] = React.useState(1);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [selectedSite, setSelectedSite] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [noData, setNoData] = React.useState(false);
  const [topLimit, setTopLimit] = React.useState<number | "all">(10);

  const unique = (arr: string[]) => Array.from(new Set(arr.filter(x => x !== undefined && x !== null)));

  React.useEffect(() => {
    if (!chartRef.current) return;
    const instance = echarts.init(chartRef.current);
    setChart(instance);
    return () => instance.dispose();
  }, []);

  const getToolbox = () => ({
    show: true,
    feature: {
      saveAsImage: { title: 'Save as Image', type: 'png' },
      dataView: { title: 'View Data', readOnly: true },
      magicType: {
        type: ['line', 'bar'],
        title: { line: 'Switch to Line Chart', bar: 'Switch to Bar Chart' }
      },
      restore: { title: 'Restore' }
    }
  });

  /* ----------------- Render Levels ----------------- */
  const renderLevel1 = () => {
    if (!chart) return;
    chart.clear();
    const states = unique(data.map(d => d.State ?? "Unknown"));
    const chartData = states.map(st => ({ name: st, value: data.filter(d => (d.State ?? "Unknown") === st).length }));
    chartData.sort((a, b) => b.value - a.value);

    chart.setOption({
      title: { text: "Categories by State" },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const state = params.name ?? "Unknown";
          const filteredData = data.filter(d => (d.State ?? "Unknown") === state);
          return `State: ${state}<br/>Total Cases: ${filteredData.length}<br/>Sites: ${unique(filteredData.map(d => d.SiteName ?? "Unknown")).length}`;
        },
      },
      toolbox: getToolbox(),
      xAxis: { type: "category", data: chartData.map(d => d.name), axisTick: { alignWithLabel: true } },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: chartData.map(d => ({
            value: d.value,
            itemStyle: { color: getStateColor(d.name) },
            label: { show: true, position: "top", formatter: (params: { value: any; }) => params.value },
          })),
        },
      ],
    });

  };

  const renderLevel2 = (state: string, topSite: any) => {
    if (!chart) return;
    chart.clear();

    let filteredData = data.filter(d => (d.State ?? "Unknown") === state);
    const sitesData = unique(filteredData.map(d => d.SiteName ?? "Unknown"))
      .map(site => ({ name: site, value: filteredData.filter(d => (d.SiteName ?? "Unknown") === site).length }))
      .sort((a, b) => b.value - a.value);

    // Apply Top N limit
    const sortedData = topSite === "all" ? sitesData : sitesData.slice(0, Number(topSite));

    chart.setOption({
      title: { text: `Sites in ${state}` },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const site = params.name ?? "Unknown";
          const siteData = filteredData.filter(d => (d.SiteName ?? "Unknown") === site);
          return `Site: ${site}<br/>Total Cases: ${siteData.length}<br/>Category: ${unique(siteData.map(d => d.Category ?? "Unknown")).length}`;
        },
      },
      toolbox: getToolbox(),
      xAxis: { type: "category", data: sortedData.map(d => d.name), axisLabel: { rotate: 15, interval: 0 } },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: sortedData.map((d, i) => ({
            value: d.value,
            itemStyle: { color: defaultBarColors[i % defaultBarColors.length] },
            label: { show: true, position: "top", formatter: (params: { value: any }) => params.value },
          })),
        },
      ],
    });
  };

  const renderLevel3 = (state: string, site: string) => {
    if (!chart) return;
    chart.clear();
    const filteredData = data.filter(d => (d.State ?? "Unknown") === state && (d.SiteName ?? "Unknown") === site);
    const categoryData = unique(filteredData.map(d => d.Category ?? "Unknown"))
      .map(ht => ({ name: ht, value: filteredData.filter(d => (d.Category ?? "Unknown") === ht).length }))
      .sort((a, b) => b.value - a.value);

    chart.setOption({
      title: { text: `Categories - ${site}` },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const ht = params.name ?? "Unknown";
          const htData = filteredData.filter(d => (d.Category ?? "Unknown") === ht);
          return `Category: ${ht}<br/>Total Cases: ${htData.length}<br/>Sub-Category: ${unique(htData.map(d => d.SubCategory ?? "Unknown")).length}`;
        },
      },
      toolbox: getToolbox(),
      xAxis: { type: "category", data: categoryData.map(d => d.name) },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: categoryData.map((d, i) => ({
            value: d.value,
            itemStyle: { color: defaultBarColors[i % defaultBarColors.length] },
            label: { show: true, position: "top", formatter: (params: { value: any; }) => params.value },
          })),
        },
      ],
    });
  };

  const renderLevel4 = (state: string, site: string, category: string) => {
    if (!chart) return;
    chart.clear();
    const filteredData = data.filter(
      d =>
        (d.State ?? "Unknown") === state &&
        (d.SiteName ?? "Unknown") === site &&
        (d.Category ?? "Unknown") === category
    );
    const subCategoryData = unique(filteredData.map(d => d.SubCategory ?? "Unknown"))
      .map(sub => ({ name: sub, value: filteredData.filter(d => (d.SubCategory ?? "Unknown") === sub).length }))
      .sort((a, b) => b.value - a.value);

    chart.setOption({
      title: { text: `Sub Categories - ${category}` },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const sub = params.name ?? "Unknown";
          const subData = filteredData.filter(d => (d.SubCategory ?? "Unknown") === sub);
          return `Sub-Category: ${sub}<br/>Total Cases: ${subData.length}<br/>Reporters: ${unique(subData.map(d => d.ReportedBy ?? "Unknown")).length}`;
        },
      },
      toolbox: getToolbox(),
      xAxis: { type: "category", data: subCategoryData.map(d => d.name), axisLabel: { rotate: 10, interval: 0 } },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: subCategoryData.map((d, i) => ({
            value: d.value,
            itemStyle: { color: defaultBarColors[i % defaultBarColors.length] },
            label: { show: true, position: "top", formatter: (params: { value: any; }) => params.value },
          })),
        },
      ],
    });
  };

  const renderLevel5 = (state: string, site: string, category: string, subCategory: string) => {
    if (!chart) return;
    chart.clear();

    const filteredData = data.filter(
      d =>
        (d.State ?? "Unknown") === state &&
        (d.SiteName ?? "Unknown") === site &&
        (d.Category ?? "Unknown") === category &&
        (d.SubCategory ?? "Unknown") === subCategory
    );

    const submissionDates = unique(filteredData.map(d => d.SubmissionDate ?? "Unknown"))
      .sort((a, b) => {
        const totalA = filteredData.filter(d => (d.SubmissionDate ?? "Unknown") === a).length;
        const totalB = filteredData.filter(d => (d.SubmissionDate ?? "Unknown") === b).length;
        return totalB - totalA;
      });

    const submitters = unique(filteredData.map(d => d.ReportedBy ?? "Unknown"));

    const series = submitters.map((user, idx) => ({
      name: user,
      type: "bar",
      stack: "total",
      emphasis: { focus: "series" },
      itemStyle: { color: defaultBarColors[idx % defaultBarColors.length] },
      data: submissionDates.map(date =>
        filteredData.filter(d => (d.SubmissionDate ?? "Unknown") === date && (d.ReportedBy ?? "Unknown") === user).length
      )
    }));

    chart.setOption({
      title: { text: `Response Submitters by Date - ${subCategory}` },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          const date = params[0]?.name ?? "Unknown";
          const total = params.reduce((sum: number, p: any) => sum + (p.value ?? 0), 0);

          const individualCounts = params
            .map((p: any) => `${p.seriesName}: ${p.value}`)
            .join("<br/>");

          return `Date: ${date}<br/>Total Submissions: ${total}<br/>Sub Category: ${subCategory}<br/>${individualCounts}`;
        }
      },
      toolbox: getToolbox(),
      xAxis: { type: "category", data: submissionDates, axisLabel: { rotate: 15, interval: 0 } },
      yAxis: { type: "value" },
      legend: { show: true },
      series: series.map((s, idx) => ({
        ...s,
        label: idx === series.length - 1
          ? {
            show: true,
            position: "top",
            formatter: (params: any) =>
              series.reduce((sum, serie) => sum + (serie.data[params.dataIndex] ?? 0), 0)
          }
          : {
            show: true,
            position: "inside",
            formatter: (params: any) => params.value
          }
      }))
    });
  };

  /* ---------------- Click handler ---------------- */

  React.useEffect(() => {
    if (!chart) return;

    const onClick = (params: any) => {
      const param = Array.isArray(params) ? params[0] : params;
      const name = param.name ?? "Unknown";

      if (siteName) {
        if (level === 3) {
          setSelectedCategory(name);
          setLevel(4);
          renderLevel4(selectedState!, selectedSite!, name);
        } else if (level === 4) {
          setLevel(5);
          renderLevel5(selectedState!, selectedSite!, selectedCategory!, name);
        }
      } else {
        if (level === 1) { setSelectedState(name); setLevel(2); renderLevel2(name, topLimit); }
        else if (level === 2) { setSelectedSite(name); setLevel(3); renderLevel3(selectedState!, name); }
        else if (level === 3) { setSelectedCategory(name); setLevel(4); renderLevel4(selectedState!, selectedSite!, name); }
        else if (level === 4) { setLevel(5); renderLevel5(selectedState!, selectedSite!, selectedCategory!, name); }
      }
    };

    const onRestore = () => {
      if (siteName) {
        const filteredData = data.filter(
          d => (d.SiteName ?? "Unknown") === siteName
        );

        if (filteredData.length === 0) {
          setNoData(true);
          return;
        }

        const firstState = filteredData[0].State ?? "Unknown";
        setSelectedState(firstState);
        setSelectedSite(siteName);
        setSelectedCategory(null);
        setLevel(3);

        renderLevel3(firstState, siteName);
      } else {
        setNoData(false);
        setLevel(1);
        setSelectedState(null);
        setSelectedSite(null);
        setSelectedCategory(null);

        renderLevel1();
      }
    };

    chart.on("click", onClick);
    chart.on("restore", onRestore);

    return () => {
      chart.off("click", onClick);
      chart.off("restore", onRestore);
    };
  }, [chart, level, selectedState, selectedSite, selectedCategory]);

  // React.useEffect(() => {
  //   if (chart) renderLevel1();
  // }, [chart]);

  React.useEffect(() => {
    if (!chart) return;

    if (siteName) {
      const filteredData = data.filter(
        d => (d.SiteName ?? "Unknown") === siteName
      );

      if (filteredData.length === 0) {
        setNoData(true);
        return;
      }

      setNoData(false);
      const firstState = filteredData[0].State ?? "Unknown";
      setSelectedState(firstState);
      setSelectedSite(siteName);
      setLevel(3);
      renderLevel3(firstState, siteName);
      return;
    }

    setNoData(false);
    setLevel(1);
    renderLevel1();
  }, [chart, siteName]);


  const backLevel = () => {
    if (siteName) {
      if (level === 5) { renderLevel4(selectedState!, selectedSite!, selectedCategory!); setLevel(4); }
      else if (level === 4) { renderLevel3(selectedState!, selectedSite!); setLevel(3); }
      else { renderLevel3(selectedState!, selectedSite!); setLevel(3); }
    } else {
      if (level === 5) { renderLevel4(selectedState!, selectedSite!, selectedCategory!); setLevel(4); }
      else if (level === 4) { renderLevel3(selectedState!, selectedSite!); setLevel(3); }
      else if (level === 3) { renderLevel2(selectedState!, topLimit); setLevel(2); }
      else { renderLevel1(); setLevel(1); }
    }
  };

  return (
    <div className="sysUsage-card mt-3">
      {level > 1 && (
        <div className="noExport">
          <div className="dflex mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "end", width: "100%", gap: '10px' }}>

            {level === 2 && (
              <div style={{ minWidth: 150 }}>
                <ReactDropdown
                  options={topDataOptions}
                  isMultiSelect={false}
                  defaultOption={topLimit}
                  onChange={(option: any) => { setTopLimit(option?.value); renderLevel2(selectedState!, option?.value); }}
                  placeholder="Select Top Sites"
                  minWidth={150}
                  isSorted={false}
                />
              </div>
            )}
            <div>
              <PrimaryButton onClick={backLevel} className="btn btn-danger" text="Back" />
            </div>
          </div>
        </div>
      )}
      {data?.length > 0 && !noData ? (
        <div ref={chartRef}
          className="echarts-chart-container echarts-for-pdf"
          style={{ width: width || "100%", height: "450px" }} />
      ) : (
        <div>
          <Label className="chartLabel">Client Responses by State</Label>
          <NoRecordFound />
        </div>
      )}
    </div>
  );
};

export default StateWiseCategoryChart;
