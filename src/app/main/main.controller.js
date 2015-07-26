(function() {
    'use strict';

    angular
        .module('versionsStreamgraph')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($timeout, webDevTec, toastr) {
        var vm = this;

        vm.awesomeThings = [];

        var layers = [
            [
                { x: 0, y: 6 },
                { x: 1, y: 6 },
                { x: 2, y: 6 },
                { x: 3, y: 5 },
                { x: 4, y: 4 },
                { x: 5, y: 1 },
                { x: 6, y: 0 },
                { x: 7, y: 0 }
            ], [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 1 },
                { x: 4, y: 2 },
                { x: 5, y: 4 },
                { x: 6, y: 3 },
                { x: 7, y: 1 }
            ], [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
                { x: 4, y: 0 },
                { x: 5, y: 1 },
                { x: 6, y: 3 },
                { x: 7, y: 5 }
            ]
        ];

        buildGraph();

        function buildGraph() {

            var n = 3, // number of layers
                m = 8, // number of samples per layer
                stack = d3.layout.stack();//.offset("wiggle");

            var versionsLayer = stack(layers);

            var width = 1200,
                height = 500;

            var x = d3.scale.linear()
                .domain([0, m - 1])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, d3.max(versionsLayer, function(layer) {
                    return d3.max(layer, function(d) {
                        return d.y0 + d.y;
                    });
                })])
                .range([0, height]);

            var color = d3.scale.category10();

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

            var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);

            svg.selectAll("path")
                .data(versionsLayer)
                .enter().append("path")
                .attr("d", area)
                .style("fill", function() {
                    return color(Math.random());
                });

            // Inspired by Lee Byron's test data generator.
            function bumpLayer(n) {

                function bump(a) {
                    var x = 1 / (.1 + Math.random()),
                        y = 2 * Math.random() - .5,
                        z = 10 / (.1 + Math.random());
                    for (var i = 0; i < n; i++) {
                        var w = (i / n - y) * z;
                        a[i] += x * Math.exp(-w * w);
                    }
                }

                var a = [],
                    i;
                for (i = 0; i < n; ++i) a[i] = 0;
                for (i = 0; i < 5; ++i) bump(a);
                return a.map(function(d, i) {
                    return {
                        x: i,
                        y: Math.max(0, d)
                    };
                });
            }
        }

        /* Inspired by Lee Byron's test data generator. */
        function stream_layers(n, m, o) {
            if (arguments.length < 3) o = 0;

            function bump(a) {
                var x = 1 / (.1 + Math.random()),
                    y = 2 * Math.random() - .5,
                    z = 10 / (.1 + Math.random());
                for (var i = 0; i < m; i++) {
                    var w = (i / m - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }
            return d3.range(n).map(function() {
                var a = [],
                    i;
                for (i = 0; i < m; i++) a[i] = o + o * Math.random();
                for (i = 0; i < 5; i++) bump(a);
                return a.map(stream_index);
            });
        }

        /* Another layer generator using gamma distributions. */
        function stream_waves(n, m) {
            return d3.range(n).map(function(i) {
                return d3.range(m).map(function(j) {
                    var x = 20 * j / m - i / 3;
                    return 2 * x * Math.exp(-.5 * x);
                }).map(stream_index);
            });
        }

        function stream_index(d, i) {
            return {
                x: i,
                y: Math.max(0, d)
            };
        }
    }
})();
