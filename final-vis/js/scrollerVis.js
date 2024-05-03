class ScrollerVis {

  constructor(_config, _data, _majorData, _industryData, _companyData, _programData) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 400,
      containerHeight: 500,
      cellWidth: 10,
      cellHeight: 10,
      cellSpacing: 5,
      yAxisWidth: 150,
      barHeight: 20,
      barSpacing: 10,
      margin: {top: 5, right: 30, bottom: 5, left: 5},
      steps: ['step0', 'step1', 'step2', 'step3', 'step4', 'step5']
    }
    this.data = _data;
    this.majorData = _majorData;
    this.industryData = _industryData;
    this.companyData = _companyData;
    this.programData = _programData;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Calculate number of columns and rows for the grid layout
    vis.config.columns = Math.floor(vis.config.width / (vis.config.cellWidth + vis.config.cellSpacing));
    vis.config.rows = Math.ceil(vis.data.length / vis.config.columns);

    // Initialize xScale, but domain depends on the step
    vis.xScale = d3.scaleLinear()
      .range([0, vis.config.width-vis.config.yAxisWidth]); 

    // Initialize scales
    vis.colorScale = d3.scaleOrdinal()
        .range(['#F4DDDD', '#D42121', '#c5eadf'])
        .domain(['default','highlighted', 'inactive']);

    // Call first step
    vis.step0();
    
  }

  step0() {
    const vis = this;

    vis.rect = vis.chart.selectAll('rect')
    .data(data, d => d.major).join('rect');

    // Arrange rectangles in grid layout and set a default colour
    vis.rect
        .attr('fill', vis.colorScale('default'))
        .attr('width', d => vis.config.cellWidth)
        .attr('height', d => vis.config.cellHeight)
        .attr('x', (d, i) => i % vis.config.columns * (vis.config.cellWidth + vis.config.cellSpacing))
        .attr('y', (d, i) => Math.floor(i / vis.config.columns) % vis.config.rows * (vis.config.cellHeight + vis.config.cellSpacing));
  }

  step1() {
    const vis = this;

    // Change the colour of some rectangles to highlight them
    vis.rect.transition().duration(500)
        .attr('fill', d => d["Employment Status"]=='Employed' ? vis.colorScale('highlighted') : vis.colorScale('default'));
  }

  step2() {
    const vis = this;

    // if there are any rectangles attached, then remove them
    if(vis.rect._groups[0].length === 10) {
      vis.rect = vis.chart.selectAll('rect')
      .data(data, d => d.major).join('rect')
      .attr('fill', vis.colorScale('default'))
      .attr('width', d => vis.config.cellWidth)
      .attr('height', d => vis.config.cellHeight)
      .attr('x', (d, i) => i % vis.config.columns * (vis.config.cellWidth + vis.config.cellSpacing))
      .attr('y', (d, i) => Math.floor(i / vis.config.columns) % vis.config.rows * (vis.config.cellHeight + vis.config.cellSpacing));
    }

    // remove the text from the previous bar graph
    if(vis.textG) vis.textG.remove();

    // Change the colour of some rectangles to highlight them
    vis.rect.transition().duration(500)
        .attr('fill', d => d["Employment Status"]=='Continuing Education' ? vis.colorScale('highlighted') : vis.colorScale('default'));
  }


  // Top 10 companies that graduate survey respondents are working for
  step3() {
    const vis = this;

     // remove the text from the previous bar graph
    if(vis.textG) vis.textG.remove();

    vis.xScale.domain([0, d3.max(vis.companyData, d => d.numStudents)]);

    vis.rect = vis.chart.selectAll('rect')
      .data(vis.companyData, d => d.company).join('rect')
        .attr('fill', vis.colorScale('highlighted'))
        .attr('x', vis.config.yAxisWidth)
        .attr('y', d => d.rank * (vis.config.barHeight + vis.config.barSpacing))
        .attr('height', d => vis.config.barHeight)
        .attr('opacity', 0)
      .transition().duration(1000)
        .attr('opacity', 1)
        .attr('width', d => vis.xScale(d.numStudents));

    vis.textG = vis.chart.selectAll('g')
        .data(vis.companyData.filter(d => d.rank >= 0))
      .join('g')
        .attr('opacity', 0)
        .attr('transform', d => `translate(${vis.config.yAxisWidth},${d.rank * (vis.config.barHeight + vis.config.barSpacing)})`);

    vis.textG.append('text')
        .attr('class', 'chart-label chart-label-name')
        .attr('text-anchor', 'end')
        .attr('dy', '0.35em')
        .attr('x', -3)
        .attr('y', vis.config.barHeight/2)
        .text(d => d.company);

    vis.textG.append('text')
        .attr('class', 'chart-label chart-label-val')
        .attr('dy', '0.35em')
        .attr('x', 5)
        .attr('y', vis.config.barHeight/2)
        .text(d => d.numStudents);

    vis.textG.transition().duration(1000)
        .attr('opacity', 1);
  }

  // Top 10 programs that graduate survey respondents are continuing education at
  step4() {
    const vis = this;

    // remove the text from the previous bar graph
    if(vis.textG) vis.textG.remove();

    vis.xScale.domain([0, d3.max(vis.programData, d => d.numStudents)]);

    vis.rect = vis.chart.selectAll('rect')
      .data(vis.programData, d => d.program).join('rect')
        .attr('fill', vis.colorScale('highlighted'))
        .attr('x', vis.config.yAxisWidth)
        .attr('y', d => d.rank * (vis.config.barHeight + vis.config.barSpacing))
        .attr('height', d => vis.config.barHeight)
        .attr('opacity', 0)
      .transition().duration(1000)
        .attr('opacity', 1)
        .attr('width', d => vis.xScale(d.numStudents));

    vis.textG = vis.chart.selectAll('g')
        .data(vis.programData.filter(d => d.rank >= 0))
      .join('g')
        .attr('opacity', 0)
        .attr('transform', d => `translate(${vis.config.yAxisWidth},${d.rank * (vis.config.barHeight + vis.config.barSpacing)})`);

    vis.textG.append('text')
        .attr('class', 'chart-label chart-label-name')
        .attr('text-anchor', 'end')
        .attr('dy', '0.35em')
        .attr('x', -3)
        .attr('y', vis.config.barHeight/2)
        .text(d => d.program);

    vis.textG.append('text')
        .attr('class', 'chart-label chart-label-val')
        .attr('dy', '0.35em')
        .attr('x', 5)
        .attr('y', vis.config.barHeight/2)
        .text(d => d.numStudents);

    vis.textG.transition().duration(1000)
        .attr('opacity', 1);
  }
  
  // Top 5 majors that survey respondents graduated with
  step5() {
    const vis = this;

    // remove the text from the previous bar graph
    if(vis.textG) vis.textG.remove();

    vis.xScale.domain([0, d3.max(vis.majorData, d => d.numStudents)]);

    vis.rect = vis.chart.selectAll('rect')
      .data(vis.majorData, d => d.program).join('rect')
        .attr('fill', vis.colorScale('highlighted'))
        .attr('x', vis.config.yAxisWidth)
        .attr('y', d => d.rank * (vis.config.barHeight + vis.config.barSpacing))
        .attr('height', d => vis.config.barHeight)
        .attr('opacity', 0)
      .transition().duration(1000)
        .attr('opacity', 1)
        .attr('width', d => vis.xScale(d.numStudents));

    vis.textG = vis.chart.selectAll('g')
        .data(vis.majorData.filter(d => d.rank >= 0))
      .join('g')
        .attr('opacity', 0)
        .attr('transform', d => `translate(${vis.config.yAxisWidth},${d.rank * (vis.config.barHeight + vis.config.barSpacing)})`);

    vis.textG.append('text')
        .attr('class', 'chart-label chart-label-name')
        .attr('text-anchor', 'end')
        .attr('dy', '0.35em')
        .attr('x', -3)
        .attr('y', vis.config.barHeight/2)
        .text(d => d.major);

    vis.textG.append('text')
        .attr('class', 'chart-label chart-label-val')
        .attr('dy', '0.35em')
        .attr('x', 5)
        .attr('y', vis.config.barHeight/2)
        .text(d => d.numStudents);

    vis.textG.transition().duration(1000)
        .attr('opacity', 1);
  }

  goToStep(stepIndex) {
    this[this.config.steps[stepIndex]]();
  }
}