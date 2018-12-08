const xValue = d => d.participant;
const xLabel = 'Participants';

const yValue = d => d.pci;
const yLabel = 'PCI';

const colorValue = d => d.state.replace('_', ' ');
const colorLabel = 'State';

const margin = { left: 120, right: 300, top: 20, bottom: 120 };

const svg = d3.select('svg');
const width = svg.attr('width');
const height = svg.attr('height');
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
const xAxisG = g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`);
const yAxisG = g.append('g');
const colorLegendG = g.append('g')
    .attr('transform', `translate(${innerWidth + 70}, 100)`);

xAxisG.append('text')
    .attr('class', 'axis-label')
    .attr('x', innerWidth / 2)
    .attr('y', 70)
    .text(xLabel);

yAxisG.append('text')
    .attr('class', 'axis-label')
    .attr('x', -innerHeight / 2)
    .attr('y', -50)
    .attr('transform', `rotate(-90)`)
    .style('text-anchor', 'middle')
    .text(yLabel);

colorLegendG.append('text')
    .attr('class', 'legend-label')
    .attr('x', 5)
    .attr('y', -30)
    .text(colorLabel);

const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal()
    .range(d3.schemeCategory10);

const xAxis = d3.axisBottom()
    .scale(xScale)
    .tickPadding(15)
    .tickSize(-innerHeight);

const yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(5)
    .tickPadding(15)
    .tickSize(-innerWidth);

const colorLegend = d3.legendColor()
    .scale(colorScale)
    .shape('circle');

const row = d => {
    d.participant = +d.participant;
    d.pci = +d.pci;
    d.measurement = +d.measurement;
    return d;
};

d3.tsv('../data/pci_data.tsv', row, data => {
    const maxValues = _.chain(data)
        .groupBy(d => d.participant)
        .mapValues(items => _.maxBy(items, d => d.pci))
        .values().value();
    
    data.forEach(d => {
        const v = _.find(maxValues, o => o.measurement == d.measurement)
        d.max = v ? true : false;
    });

    xScale
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth])
        .nice();

    yScale
        .domain(d3.extent(data, yValue))
        .range([innerHeight, 0])
        .nice();

    g.selectAll('circle').data(data)
        .enter().append('circle')
        .attr('cx', d => xScale(xValue(d)))
        .attr('cy', d => yScale(yValue(d)))
        .attr('fill', d => colorScale(colorValue(d)))
        .attr('fill-opacity', d => d.max ? 0.6 : 0.25)
        .attr('r', d => d.max ? 5 : 2.5);

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);
    colorLegendG.call(colorLegend)
        .selectAll('.cell text')
        .attr('dy', '0.1em');
});