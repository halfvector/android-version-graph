(function() {
    'use strict';

    angular
        .module('versionsStreamgraph')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($timeout, webDevTec, toastr) {
        var vm = this;

        var dateFormat = d3.time.format("%Y-%m-%d");

        d3.csv('assets/android_versions.csv', function(data) {
            var keys = d3.range(2, 22); // api version numbers
            var versions = [];

            data.forEach(function(d) {
                // each row contains multiple columns, where each column is a version layer
                keys.forEach(function(k) {
                    versions.push({
                            version: k,
                            x: dateFormat.parse(d.Date),
                            y: +d[k]
                        });
                });
            });

            var numSamples = 65; //versionMap[keys[0]].length;
            buildGraph(keys, versions, numSamples);
        });

        function buildGraph(keys, versions, numSamples) {
            var n = keys.length, // number of layers
                m = numSamples; // number of samples per layer

            console.log("n = " + n);
            console.log("m = " + m);

            var nest = d3.nest().key(function(d) {
                return d.version;
            });

            var stack = d3.layout.stack()
                // .offset("wiggle")
                .values(function(d) {
                    return d.values;
                });

            var versionsLayer = stack(nest.entries(versions));

            var margin = {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 20
                },
                width = 1000 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var x = d3.time.scale()
                // .domain([0, m - 1])
                .domain(d3.extent(versions, function(d) {
                    return d.x;
                }))
                .range([0, width - margin.left - margin.right]);

            var y = d3.scale.linear()
                .domain([0, 100])
                .range([0, height]);

            var color = d3.scale.category20c();

            var area = d3.svg.area()
                .x(function(d) {
                    return x(d.x);
                })
                .y0(function(d) {
                    return y(d.y0);
                })
                .y1(function(d) {
                    return y(d.y0 + d.y);
                });

            var svg = d3.select("body #versions-chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height + margin.bottom + margin.top)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("width", width - margin.left - margin.right)
                .attr("height", height + margin.bottom + margin.top);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(height + 10)
                .ticks(7);

            svg.selectAll("path")
                .data(versionsLayer)
                .enter()
                .append("path")
                .attr("class", "segment")
                .attr("d", function(d) {
                    return area(d.values);
                })
                .style("fill", function() {
                    return color(Math.random());
                })
                .append("title")
                .text(function(d) {
                    return "version: " + d.key;
                });


            var xAxisGeometry = svg.append("g")
                .attr("class", "x axis")
                // .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("g")
                .filter(function(d) {
                    return d;
                })
                .classed("minor", true);
        }
    }
})();
