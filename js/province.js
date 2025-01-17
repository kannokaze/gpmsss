﻿// var defaults = {
//     s1: 'provid',
//     s2: 'cityid',
//     s3: 'areaid',
//     v1: null,
//     v2: null,
//     v3: null
// };

layui.define(['jquery', 'form'], function () {
    var $ = layui.jquery,
    form = layui.form,
    $form = $('form');
    
});

function treeSelect(config,threeSelectData) {
    config.v1 = config.v1 ? config.v1 : 110000;
    config.v2 = config.v2 ? config.v2 : 110100;
    config.v3 = config.v3 ? config.v3 : 110101;
    $.each(threeSelectData, function (k, v) {
        appendOptionTo($form.find('select[name=' + config.s1 + ']'), k, v.val, config.v1);
    });
    form.render();
    cityEvent(config,threeSelectData);
    areaEvent(config,threeSelectData);
    form.on('select(' + config.s1 + ')', function (data) {
        cityEvent(data,threeSelectData);
        form.on('select(' + config.s2 + ')', function (data) {
            areaEvent(data,threeSelectData);
        });
    });

    function cityEvent(data,threeSelectData) {
        $form.find('select[name=' + config.s2 + ']').html("");
        config.v1 = data.value ? data.value : config.v1;
        $.each(threeSelectData, function (k, v) {
            if (v.val == config.v1) {
                if (v.items) {
                    $.each(v.items, function (kt, vt) {
                        appendOptionTo($form.find('select[name=' + config.s2 + ']'), kt, vt.val, config.v2);
                    });
                }
            }
        });
        form.render();
        config.v2 = $('select[name=' + config.s2 + ']').val();
        areaEvent(config,threeSelectData);
    }
    function areaEvent(data,threeSelectData) {
        $form.find('select[name=' + config.s3 + ']').html("");
        config.v2 = data.value ? data.value : config.v2;
        $.each(threeSelectData, function (k, v) {
            if (v.val == config.v1) {
                if (v.items) {
                    $.each(v.items, function (kt, vt) {
                        if (vt.val == config.v2) {
                            $.each(vt.items, function (ka, va) {
                                appendOptionTo($form.find('select[name=' + config.s3 + ']'), ka, va, config.v3);
                            });
                        }
                    });
                }
            }
        });
        form.render();
        form.on('select(' + config.s3 + ')', function (data) { });
    }
    function appendOptionTo($o, k, v, d) {
        var $opt = $("<option>").text(k).val(v);
        if (v == d) { $opt.attr("selected", "selected") }
        $opt.appendTo($o);
    }
}