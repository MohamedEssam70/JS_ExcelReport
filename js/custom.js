// to get current year
function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    document.querySelector("#displayYear").innerHTML = currentYear;
}

getYear();

// nice select
$(document).ready(function () {
    $('select').niceSelect();
});

var file_name;
var file_icon;
$("form").on("change", ".file-input", function(e){
    
    if(e.target.files.length <= 0){
        // $(".file-upload-wrapper").attr("data-text", "xx");
        if($(this).attr('name') === 'english_file_name') {
            $("#englishIcon").attr("class", "fa fa-cloud-upload");
            $("#en-name").attr("data-text", "Select English File");
        }
        else if($(this).attr('name') === 'arabic_file_name') {
            $("#arabicIcon").attr("class", "fa fa-cloud-upload");
            $("#ar-name").attr("data-text", "Select Arabic File");
        }
        else{}
    } else{
        if($(this).attr('name') === 'english_file_name') {
            $("#en-name").attr("data-text", $(this).val().replace(/.*(\/|\\)/, ''));
            $("#englishIcon").attr("class", "fa-solid fa-circle-check fa-bounce pd-bottom");
        }
        else if($(this).attr('name') === 'arabic_file_name') {
            $("#ar-name").attr("data-text", $(this).val().replace(/.*(\/|\\)/, ''));
            $("#arabicIcon").attr("class", "fa-solid fa-circle-check fa-bounce pd-bottom");
        }
        else{}
    }
});



$(document).ready(function(){
    $("#output").click(function (event) {

        if($("input:file")[0].files.length + $("input:file")[1].files.length == 0)
        {
            toast("You have to uploade JSON files first", 'fade', 'bottom-left', 'Faild!', 'error', '#a9444', 'white', true);
            console.log("ddd")
        }
        else if($("input:file")[0].files.length + $("input:file")[1].files.length == 1)
        {
            if($("input:file")[0].files.length == 0) toast("English File Not Uploaded", 'fade', 'bottom-left', 'Faild!', 'error', '#a9444', 'white', true);
            else toast("Arabic File Not Uploaded", 'fade', 'bottom-left', 'Faild!', 'error', '#a9444', 'white', true);
        } else if($("input:file")[0, 1].files){
            var end = false;
            var keys = [];

            var reader_en = new FileReader();
            reader_en.onload = function(){
                var obj_en = JSON.parse(reader_en.result);
                keys = Object.keys(obj_en);
                OpenTable("KEY", Object.keys(obj_en));
                AddColumn("VALUE", Object.values(obj_en));
            }
            reader_en.readAsText($("input:file[name='english_file_name']")[0].files[0]);
            
            var reader_ar = new FileReader();
            reader_ar.onload = function(){
                var obj_ar = JSON.parse(reader_ar.result);
                var sortByKey = {};
                for(var key in keys){
                    var value = obj_ar[keys[key]];
                    if(value == undefined)
                    {
                        sortByKey[keys[key]] = "";
                    }
                    else
                    {
                        sortByKey[keys[key]] = value;
                    }
                }
                end = true;
                AddColumn("VALUE", Object.values(sortByKey));
            }
            reader_ar.readAsText($("input:file[name='arabic_file_name']")[0].files[0]);
            
            CloseTable();

            const observer = new MutationObserver(function (mutations, mutationInstance) {
                if (end) {
                    fnExcelReport();
                    mutationInstance.disconnect();
                }
            });
            observer.observe(document, {
                childList: true,
                subtree:   true
            });

            toast("Report Downloaded", 'fade', 'bottom-left', 'Success!', 'success', '#3c763d', 'white', true);
        } 
    });
});



var tab_text;
var data_type = 'data:application/vnd.ms-excel';

function OpenTable(ColumnHead, ListOfMessages)
{
    var TableMarkUp='<table id="myModifiedTable" class="visibilityHide"><thead id="TableHead"><tr><td><b>'+ ColumnHead +'</b></td>  </tr></thead><tbody id="TableBody">';

    for(i=0; i<ListOfMessages.length; i++){
        TableMarkUp += '<tr><td>' + ListOfMessages[i] +'</td></tr>';
    }
    $('#ReportPreview').append(TableMarkUp);
}

function AddColumn(ColumnHead, ListOfMessages)
{
    var NewColumn ='<td><b>'+ ColumnHead +'</b></td>';
    $("#TableHead tr").append(NewColumn);

    var rows = $("#TableBody tr");
    var MessageIndex = 0;
    var CellMarkUp;
    $.each( rows, function(row){
        CellMarkUp = '<td>' + ListOfMessages[MessageIndex] +'</td>';
        $(rows[row]).append(CellMarkUp);
        MessageIndex++;
    });
}

function CloseTable()
{
    $('#ReportPreview').append("</tbody></table>");
}

function fnExcelReport()
{
    tab_text = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    tab_text = tab_text + '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';

    tab_text = tab_text + '<x:Name>'+ $("#ReportName").val() +'</x:Name>';

    tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
    tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';

    tab_text = tab_text + "<table border='1px'>";
    tab_text = tab_text + $('#myModifiedTable').html();
    tab_text = tab_text + '</table></body></html>';

    data_type = 'data:application/vnd.ms-excel';

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        if (window.navigator.msSaveBlob) {
            var blob = new Blob([tab_text], {
                type: "application/csv;charset=utf-8;"
            });
            navigator.msSaveBlob(blob, $("#ReportName").val()+'.xls');
        }
    } else {
        console.log(data_type);
        console.log(tab_text);
        $('#downloadAction')[0].click()
    }
    $('#ReportPreview').html("");
}

$($("#downloadAction")[0]).click(function(){
console.log(data_type);
console.log(tab_text);
$('#downloadAction').attr('href', data_type + ', ' + encodeURIComponent(tab_text));
$('#downloadAction').attr('download', $("#ReportName").val()+'.xls');
});


function toast(message, trans, position, heading, icon, bgColor, textColor, close){
    $.toast({ 
      heading: heading,
      text : message, 
      showHideTransition : trans,  
      bgColor : bgColor,              
      textColor : textColor,            
      allowToastClose : close,       
      hideAfter : 5000,
      icon: icon,              
      stack : 5,                     
      textAlign : 'left',            
      position : position
    })
  }