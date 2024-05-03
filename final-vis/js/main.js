let data, scrollerVis;

d3.csv('data/Final Project Data - employmentStatusByMajor.csv').then(_data => {
  // Breakdown of students - majors, industries, graduation year
  data = _data;

  // Data by major (ChatGPT code - prompted to group by major and get the number of students in each)
  let majorData = [];
  const uniqueMajors = new Set(data.map(row => row['Major']));
  uniqueMajors.forEach(major => {
    const numStudents = data.filter(item => item['Major'] === major).length;
    majorData.push({ major: major, numStudents: numStudents });
  });
  majorData = findRanks(5, majorData, 'major');

  // Data by Industry
  let industryData = [];
  const uniqueIndustries = new Set(data.map(row => row['Sector/Industry']));
  uniqueIndustries.forEach(industry => {
    const numStudents = data.filter(item => item['Sector/Industry'] === industry).length;
    industryData.push({ industry: industry, numStudents: numStudents });
  });
  industryData = findRanks(5, industryData, 'industry');

  // Data by Company
  let companyData = [];
  const uniqueCompanies = new Set(data.filter(row => row['Employment Status'] === "Employed").map(row => row['Organization/Institution']));
  uniqueCompanies.forEach(company => {
    const numStudents = data.filter(item => item['Organization/Institution'] === company).length;
    companyData.push({ company: company, numStudents: numStudents });
  });
  companyData = findRanks(10, companyData, 'company');

  // Data by Institution
  let programData = [];
  const uniquePrograms = new Set(data.filter(row => row['Employment Status'] === "Continuing Education").map(row => row['Organization/Institution']));
  uniquePrograms.forEach(program => {
    const numStudents = data.filter(item => item['Organization/Institution'] === program).length;
    programData.push({ program: program, numStudents: numStudents });
  });
  programData = findRanks(10, programData, 'program');

  // console.log(companyData);
  // console.log(programData);
  // console.log(majorData);
  // console.log(industryData);
  // console.log(data);

  // Update text on the web page based on the loaded dataset
  d3.select('#student-count').text(data.length);
  d3.select('#employed-count').text(data.filter(row => row['Employment Status'] === "Employed").length);
  d3.select('#education-count').text(data.filter(row => row['Employment Status'] === "Continuing Education").length);
  d3.select('#company-count').text(companyData.slice().sort((a, b) => b.numStudents - a.numStudents)[0].company);
  d3.select('#program-count').text(programData.slice().sort((a, b) => b.numStudents - a.numStudents)[0].program);
  d3.select('#major-count').text(majorData.slice().sort((a, b) => b.numStudents - a.numStudents)[0].major);
  
  // Initialize visualization
  scrollerVis = new ScrollerVis({ parentElement: '#vis'}, data, majorData, industryData, companyData, programData);
  
  // Create a waypoint for each `step` container
  const waypoints = d3.selectAll('.step').each( function(d, stepIndex) {
    return new Waypoint({
      // `this` contains the current HTML element
      element: this,
      handler: function(direction) {
        // Check if the user is scrolling up or down
        const nextStep = direction === 'down' ? stepIndex : Math.max(0, stepIndex - 1)
        // Update visualization based on the current step
        scrollerVis.goToStep(nextStep);
      },
      // Trigger scroll event halfway up. Depending on the text length, 75% might be even better
      offset: '50%',
    });
  });
})
.catch(error => console.error(error));

function findRanks(numToRank, data, nameColumn) {
  // Filter out empty strings from topNames
  const topData = [...data].filter(d => d[nameColumn] !== '').sort((a,b) => b.numStudents - a.numStudents).slice(0, numToRank);
  const topNames = topData.map(d => d[nameColumn]);
  // console.log(topNames);
  // Filter data to only include top names
  data = data.filter(d => topNames.includes(d[nameColumn]));
  data.forEach(d => {
    d.rank = topNames.indexOf(d[nameColumn]);
  })

  return data;
}