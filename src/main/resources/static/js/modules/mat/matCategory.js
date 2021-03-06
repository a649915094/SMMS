

var vm = new Vue({
    el: '#app',
    data: {
        showList: true,
        title: '',
        q: {
            item: null
        },
        material: {
            categoryId: getUrlKey('categoryId')
        },
        file: {},
        projectMaterial:{
            projectId:'',
            matId:''
        }
    },
    methods: {
        query: function () {
            vm.reload();
        },
        reload: function (event) {
            vm.showList = true;
            var page = $("#jqGrid").jqGrid('getGridParam', 'page');
            $("#jqGrid").jqGrid('setGridParam', {
                postData: {'item': vm.q.item},
                page: page
            }).trigger("reloadGrid");
        },
        add: function () {
            vm.showList = false;
            vm.title = "新增物料";
            vm.material = {
                categoryId: getUrlKey('categoryId')
            };
            vm.file={}
        },
        update: function () {
            var matId = getSelectedRow();
            if (matId == null) {
                return;
            }
            vm.showList = false;
            vm.title = "修改物料";
            vm.file={};
            vm.getMaterial(matId)
        },
        getMaterial: function (matId) {
            $.get(baseURL + "mat/material/info/" + matId, function (r) {
                vm.material = r.material;
            });
        },
        saveOrUpdate: function () {
            var url = vm.material.matId == null ? "mat/material/save" : "mat/material/update";
            $.ajax({
                type: "POST",
                url: baseURL + url,
                contentType: "application/json",
                data: JSON.stringify(vm.material),
                success: function (r) {
                    if (r.code === 0) {
                        alert('操作成功', function () {
                            vm.reload();
                        });
                    } else {
                        alert(r.msg);
                    }
                }
            });
        },
        del: function () {
            var matIds = getSelectedRows();
            if (matIds == null) {
                return;
            }
            confirm('同时会删除项目里的物料，确定要删除选中的记录？', function () {
                $.ajax({
                    type: "POST",
                    url: baseURL + "mat/material/delete",
                    contentType: "application/json",
                    data: JSON.stringify(matIds),
                    success: function (r) {
                        if (r.code == 0) {
                            alert('操作成功', function () {
                                vm.reload();
                            });
                        } else {
                            alert(r.msg);
                        }
                    }
                });
            });
        },
        downloadFile: function(type){
            location.href=baseURL+"/mat/material/download/"+vm.material.matId+"?type="+type+"&token="+token
        },
        addToProject:function () {
            var matId = getSelectedRow();
            if (matId == null) {
                return;
            }
            vm.projectMaterial.matId=matId;
            layer.open({
                type: 1,
                offset: '50px',
                skin: 'layui-layer-molv',
                title: "选择项目",
                area: ['438px','400px'],
                shade: 0,
                shadeClose: false,
                content: jQuery("#projectSelectLayer")
            });
        },
        saveMatProject:function () {
            var projectId=getprojectId();
            if (projectId == false) {
                return;
            }
            vm.projectMaterial.projectId=projectId;
            $.ajax({
                type:"POST",
                url: baseURL+"mat/project/material/save",
                contentType:"application/json",
                data: JSON.stringify(vm.projectMaterial),
                success: function (r) {
                    if(r.code==0){
                        alert('操作成功',function () {
                            layer.closeAll();
                            vm.reload();
                        });
                    }else{
                        alert(r.msg);
                    }
                }
            })
        }
    }

});
var project = {
    id: "projectTable",
    table: null,
    layerIndex: -1
};
/**
 * 初始化表格的列
 */
project.initColumn = function () {
    var columns = [
        {field: 'selectItem', radio: true},
        {title: 'ID', field: 'projectId', visible: false, align: 'center', valign: 'middle', width: '30px'},
        {title: '项目名称', field: 'name', align: 'center', valign: 'middle', sortable: true, width: '180px'},
    ];
    return columns;
};

function getprojectId() {
    var selected = $('#projectTable').bootstrapTreeTable('getSelections');
    if (selected.length == 0) {
        alert("请选择一条记录");
        return false;
    } else {
        return selected[0].id;
    }
}

$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'mat/category/material/list/' + vm.material.categoryId,
        datatype: "json",
        colModel: [
            {label: '编号', name: 'matId', index: "mat_id", width: 25, key: true},
            {
                label: '产品图像',
                name: 'productPicture',
                index: "product_picture",
                width: 90,
                formatter: function (value, options, row) {
                    return '<a href="'+baseURL+'/mat/material/productPicture?pictureName=' + value + '" target="_blank" ><img style="width: 100%;height: 120px" src="'+baseURL+'/mat/material/productPicture?pictureName=' + value + '" /></a>';
                }
            },
            {label: '部件名称', name: 'item', index: 'item', width: 90},
            {label: '部件型号', name: 'model', index: 'model', width: 70},
            {label: '应用产品', name: 'applications', index: 'applications', width: 70},
            {label: '价格', name: 'price', index: 'price', width: 35},
            {label: '生产厂家', name: 'manufacturer', index: 'manufacturer', width: 80},
            {label: '联系方式', name: 'contact', index: 'contact', width: 40},
            {label: '备注', name: 'remarks', index: 'remarks', width: 50},
            {
                label: '网址', name: 'website', index: 'website', width: 25, formatter: function (value) {
                return '<a href="' + value + '" target="_blank" title="' + value + '">查看</a>'
            }
            },
            {
                label: '资料', width: 25, formatter: function (cellvalue, options, rowObject) {
                return '<input type="button" onclick="showFile(' + rowObject.matId + ')" class="btn btn-warning  btn-xs" value="查看" />';
            }
            }
        ],
        viewrecords: true,
        multiselect: true,
        height: 485,
        rowNum: 10,
        rowList: [10, 30, 50],
        autowidth: true,
        pager: "#jqGridPager",
        jsonReader: {
            root: "page.list",
            page: "page.currPage",
            total: "page.totalPage",
            records: "page.totalCount"
        },
        prmNames: {
            page: "page",
            rows: "limit",
            order: "order"
        },
        gridComplete: function () {
            // //隐藏grid底部滚动条
            // $("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" });
        }
    });
    var colunms = project.initColumn();
    var table = new TreeTable(project.id, baseURL + "mat/project/list", colunms);
    table.setExpandColumn(2);
    table.setRootCodeValue(34);
    table.setIdField("projectId");
    table.setCodeField("projectId");
    table.setParentCodeField("parentId");
    table.setExpandAll(false);
    table.init();
    project.table = table;
});

new AjaxUpload('#explodedView', {
    action: baseURL + 'mat/material/upload/file?type=explodedView&token=' + token,
    name: 'file',
    autoSubmit: true,
    responseType: "json",
    onComplete: function (file, r) {
        if (r.code == 0) {
            Vue.set(vm.material,"explodedView",r.url);
            Vue.set(vm.file,"explodedView",file);
        } else {
            alert(r.msg);
        }
    }
});

new AjaxUpload('#technicalNote', {
    action: baseURL + 'mat/material/upload/file?type=technicalNote&token=' + token,
    name: 'file',
    autoSubmit: true,
    responseType: "json",
    onComplete: function (file, r) {
        if (r.code == 0) {
            Vue.set(vm.material,"technicalNote",r.url);
            Vue.set(vm.file,"technicalNote",file);
        } else {
            alert(r.msg);
        }
    }
});

new AjaxUpload('#relatedExperimentReport', {
    action: baseURL + 'mat/material/upload/file?type=relatedExperimentReport&token=' + token,
    name: 'file',
    autoSubmit: true,
    responseType: "json",
    onComplete: function (file, r) {
        if (r.code == 0) {
            Vue.set(vm.material,"relatedExperimentReport",r.url);
            Vue.set(vm.file,"relatedExperimentReport",file);
        } else {
            alert(r.msg);
        }
    }
});

new AjaxUpload('#assemblyDrawing2d', {
    action: baseURL + 'mat/material/upload/file?type=assemblyDrawing2d&token=' + token,
    name: 'file',
    autoSubmit: true,
    responseType: "json",
    onComplete: function (file, r) {
        if (r.code == 0) {
            Vue.set(vm.material,"assemblyDrawing2d",r.url);
            Vue.set(vm.file,"assemblyDrawing2d",file);
        } else {
            alert(r.msg);
        }
    }
});

new AjaxUpload('#assemblyDrawing3d', {
    action: baseURL + 'mat/material/upload/file?type=assemblyDrawing3d&token=' + token,
    name: 'file',
    autoSubmit: true,
    responseType: "json",
    onComplete: function (file, r) {
        if (r.code == 0) {
            Vue.set(vm.material,"assemblyDrawing3d",r.url);
            Vue.set(vm.file,"assemblyDrawing3d",file);
        } else {
            alert(r.msg);
        }
    }
});

new AjaxUpload('#uploadProductPicture', {
    action: baseURL + 'mat/material/upload/file?type=productPicture&token=' + token,
    name: 'file',
    autoSubmit: true,
    responseType: "json",
    onSubmit: function (file, extension) {
        if (!(extension && /^(jpg|jpeg|png|gif)$/.test(extension.toLowerCase()))) {
            alert('只支持jpg、png、gif格式的图片！');
            return false;
        }
    },
    onComplete: function (file, r) {
        if (r.code == 0) {
            Vue.set(vm.material,"productPicture",r.url);
        } else {
            alert(r.msg);
        }
    }
});

function showFile(matId) {
    if(!hasPermission('mat:material:download')){
        alert("未授权，请联系管理员");
        return ;
    }
    Vue.set(vm.material,"matId",matId);
    var url = "mat/material/info/" + matId;
    $.ajax({
        type: "GET",
        url: baseURL + url,
        contentType: "application/json",
        data: {},
        success: function (r) {
            if (r.code === 0) {
                vm.file = r.material;
                layer.open({
                    type: 1,
                    offset: '50px',
                    skin: 'layui-layer-molv',
                    title: "下载资料",
                    area: ['300px','280px'],
                    shade: 0,
                    shadeClose: false,
                    content: jQuery("#fileInfoLayer")
                });
            } else {
                alert(r.msg);
            }
        }
    });
}


