var $$ = Dom7;

/*
* https://www.npmjs.com/package/cesarbalzer-cordova-plugin-btprinter
* cordova plugin add https://github.com/CesarBalzer/Cordova-Plugin-BTPrinter.git
* */

var sprintText = '';
var waiting_qty = 0;
var failed_qty = 0;
var success_qty = 0;
var cancelled_qty = 0;
var is_confirmed_manually_qty = 0;

let failed_amt = 0.00;
let success_amt = 0.00;
let cancelled_amt = 0.00;
let waiting_amt = 0.00;

function void_transaction(transaction_id, montant){
    console.log('doVoid() ' + transaction_id);
    $('#o').val(transaction_id);
    $('#payment_amount').val(parseFloat(montant/100).toFixed(2));
    $('#amount_to_pay').val(parseFloat(montant/100).toFixed(2));
    $('.back').click();
    $('.card-help-block #img-enter-card').show();
    $('.card-help-block').show();
    $('.m-action-button').hide();
    $('.tchin-block-border').hide();
    $('.idp-block').hide();
    $('.remarks-list').hide();
    doVoid();

}

function transactionDetail(reason){
    app.dialog.alert(reason,'Details');
}




/*********************************************/
/* getTransaction                            */
/* Retreive Specific user transactions       */
/* $('#creator_id').val() => hidden field    */
/*********************************************/
function getTransactions(yesterday=0){
    console.log('getTransactions ' + $('#statusTransactionFilter').val());
    app.dialog.preloader('Please wait', 'default');
    $('.transaction-list-block').html('');
    $('.transaction-list-block').show();



    var formData = new FormData();

    //formData.append('creator_email', $('#creator_email').val());
    formData.append('creator_id', $('#creator_id').val());
    formData.append('ref', 'get_transactions');
    //formData.append('f', $('#f').val());
    formData.append('m', $('#m').val());
    formData.append('status', $('#statusTransactionFilter').val());
    formData.append('for_till_id', $('#device_id').val());
    formData.append('yesterday', yesterday);
    const timeStamp = new Date().getTime();

    if(yesterday == 1){
        $('#trans_title').html("Yesterday's Transactions " + $('#mn').val());
        console.log(' yesterdayDate');
        /*if($('.today').hasClass('activereport')){
            $('.today').removeClass('activereport');
            $('.today').addClass('inactivereport');
        }
        if(!$('.yesterday').hasClass('activereport')){
            $('.yesterday').removeClass('inactivereport');
            $('.yesterday').addClass('activereport');
        }*/
        $('.today').removeClass('button-active');
        $('.yesterday').addClass('button-active');

        const yesterdayTimeStamp = timeStamp - 24*60*60*1000;
        const yesterdayDate = new Date(yesterdayTimeStamp);
        formData.append('rec_start_date', formatDate(yesterdayDate));
        formData.append('rec_end_date', formatDate(yesterdayDate));
        console.log(formatDate(yesterdayDate));
    }
    else{
        $('#trans_title').text("Today's Transactions " + $('#mn').val());
        /*if($('.yesterday').hasClass('activereport')){
            $('.yesterday').removeClass('activereport');
            $('.yesterday').addClass('inactivereport');
        }
        if(!$('.today').hasClass('activereport')){
            $('.today').addClass('activereport');
            $('.today').removeClass('inactivereport');
        }*/
        $('.yesterday').removeClass('button-active');
        $('.today').addClass('button-active');
        const todayDateTimeStamp= timeStamp;
        const todayDate = new Date(todayDateTimeStamp);
        console.log(' todayDate');
        console.log(formatDate(todayDate));
        formData.append('rec_start_date', formatDate(todayDate));
        formData.append('rec_end_date', formatDate(todayDate));
    }
    console.log('formData ok ');
    app.request({
        crossDomain: true,
        method: 'POST',
        url: mymipsURL+'mips-app/get-transactions.php',
        data: formData,
        dataType: 'json',
        success: function(data) {
            console.log('formData transactions_table ');
            app.dialog.close();
            //var payments = JSON.parse(data);

            var transactions_status_table= '\n' ;
            waiting_qty = 0;
            failed_qty = 0;
            success_qty = 0;
            cancelled_qty = 0;
            is_confirmed_manually_qty = 0;

            failed_amt = 0.00;
            success_amt = 0.00;
            cancelled_amt = 0.00;
            waiting_amt = 0.00;

            var last_app_used_success = 0.00; //last_app_used

            jQuery.each(data, function( index, value ) {
                console.log(value);
                var status_class = 'red';
                var p_status = value.last_transaction_status;

                if(p_status == 'Waiting' || p_status == 'NULL' || p_status == 'Null' || p_status === null || p_status === 'null' || p_status === ''){
                    status_class = 'orange';
                    p_status = 'WAITING';
                    waiting_qty = waiting_qty + 1;
                    waiting_amt = (parseFloat(waiting_amt) + parseFloat(value.somme_totale/100)).toFixed(2);
                }
                if(p_status == 'Failed' || p_status == 'Fail' || p_status == 'FAIL'){
                    status_class = 'red';
                    console.log('Before: ' + p_status);
                    p_status = 'FAIL';
                    console.log('After: ' +p_status);
                    failed_qty = failed_qty + 1;
                    failed_amt = (parseFloat(failed_amt) + parseFloat(value.somme_totale/100)).toFixed(2);
                }
                if(p_status == 'cancelled' || p_status == 'CANCELLED'){
                    status_class = 'grey';
                    console.log('Before: ' + p_status);
                    p_status = 'CANCELLED';
                    console.log('After: ' +p_status);
                    cancelled_qty = cancelled_qty + 1;
                    cancelled_amt = (parseFloat(cancelled_amt) + parseFloat(value.somme_totale/100)).toFixed(2);
                }
                if(p_status == 'Success' ||p_status == 'SUCCESS'  ){
                    status_class = 'green';
                    success_qty = success_qty + 1;
                    success_amt = (parseFloat(success_amt) + parseFloat(value.somme_totale/100)).toFixed(2);
                    if(typeof value.is_confirmed_manually != 'undefined' && parseInt(value.is_confirmed_manually) == 1){
                        is_confirmed_manually_qty = is_confirmed_manually_qty + 1;
                    }
                }


                //Printer information

                //sprintText += '\n ' + value.id_commande_format_client + ' ' + value.symbole_monnaie + ' ' + value.somme_totale/100 + ' '+p_status;
                console.log(value);


                var additional_param = '';
                var additional_info = '';
                if(value != '' && value !== null && value.additional_param !== null) {
                    additional_param = JSON.parse(value.additional_param);

                    if (additional_param === null || additional_param === '' || typeof additional_param === 'undefined') {
                        additional_info = '';
                    } else {
                        additional_info = '<div>' + additional_param.remarks + '</div>';
                        if (typeof additional_param.phone != 'undefined' && additional_param.phone !== 'UNDEFINED' && additional_param.phone !== '' && additional_param.phone !== null)
                            additional_info = '\n<div>Phone: ' + additional_param.phone + '</div>';
                    }
                }
                if(p_status !== 'Success' && p_status !== 'SUCCESS' && value.reason !== null && value.reason !== '' && value.reason !== 'undefined'){
                    additional_info += '\n<div><a href="javascript:void(0)" class="trans_btn_detail" onclick="transactionDetail(\''+value.reason+'\')">Details</a></div>';
                }

                var trans_date_time = value.date_commande.split(' ');

                transactions_status_table += '<tr>'+

                    '<td class="item-cell trans_titre trans_datetime"><b>' + trans_date_time[0] + '</b><br/>' + trans_date_time[1] + '</td>\n' +
                    '<td class="item-cell trans_cur">'+value.symbole_monnaie+'</td><td class="item-cell trans_amt">' + (value.somme_totale/100).toFixed(2) + '\n ' +
                    //'<br/><button class="col button button-small button-fill color-blue void-action-button" id="void_transacation_btn" onclick="void_transaction(\'' + value.id_commande_format_client  + '\',\'' + value.somme_totale  + '\')">VOID</button>' +
                    '</td>\n' +
                    '<td class="rp-item-after trans_status"><span class="' + status_class + '">'+p_status + '</span>';
                    if(value.last_app_used != '' && typeof value.last_app_used !='undefined' && value.last_app_used != 'Null' &&
                        value.last_app_used != 'NULL' && value.last_app_used != null){
                        transactions_status_table += '<br> - ' + value.last_app_used + '\n';
                    }
                    else{
                        if(value.last_card_brand != '' && typeof value.last_card_brand !='undefined' && value.last_card_brand != 'Null' &&
                            value.last_card_brand != 'NULL' && value.last_card_brand != null){
                            transactions_status_table += '<br> - ' + value.last_card_brand + '\n';
                        }
                    }
                transactions_status_table += '</td>\n' +
                    '<td>'+ '\n' + additional_info + '</td>' +
                    '<td class="item-cell rp-item-title">\n' +
                    '      <div class="rp-item-header ref_id">' + value.id_commande_format_client  + '</div>' +
                    '</td>\n' +
                    '</tr>';
		//Printer information

                /*sprintText += '\n' + trans_date_time[0] + ' ' + trans_date_time[1] + '  |  ' +
                    value.symbole_monnaie+'. ' + (value.somme_totale/100).toFixed(2) + ' | ';
                sprintText += p_status;
                    if(value.last_app_used != '' && typeof value.last_app_used !='undefined' && value.last_app_used != 'Null' &&
                        value.last_app_used != 'NULL' && value.last_app_used != null){
                        sprintText += value.last_app_used  + '\n';
                    }
                //sprintText +=  additional_info + '\n - ' + value.id_commande_format_client;
                sprintText += '\n-----------------------------------------';*/
            });
            $('#transaction_row').html(transactions_status_table);
            $('#success_qty').html('Success (' + success_qty + ')');
            $('#failed_qty').html('Fail (' + failed_qty + ')');
            $('#cancelled_qty').html('Cancelled (' + cancelled_qty + ')');
            //$('#success_qty').html('Success (' + success_qty + ')');
            var summary_table = '<tr>' +
                '<td>Success</td>' +
                '<td>'+success_qty+' (Man:' + is_confirmed_manually_qty + ')</td>' +
                '<td class="amt">Rs. '+parseFloat(success_amt).toFixed(2)+'</td>' +
                '</tr>' +
                '<tr>' +
                '<td>Failed</td>' +
                '<td>'+failed_qty+'</td>' +
                '<td class="amt">Rs. '+parseFloat(failed_amt).toFixed(2)+'</td>' +
                '</tr>' +
                '<tr>' +
                '<td>Cancelled</td>' +
                '<td>'+cancelled_qty+'</td>' +
                '<td class="amt">Rs. '+parseFloat(cancelled_amt).toFixed(2)+'</td>' +
                '</tr>' +
                '<tr>' +
                '<td>Waiting</td>' +
                '<td>'+waiting_qty+'</td>' +
                '<td class="amt">Rs. '+parseFloat(waiting_amt).toFixed(2)+'</td>' +
                '</tr>';

            summary_table += '<tr><td colspan="3"><b>Total number of Transactions:</b> '+(parseFloat(success_qty)+parseFloat(failed_qty)+parseFloat(cancelled_qty)+parseFloat(waiting_qty))+'</td></tr><br/>'; //


            $('.sum_table tbody').html(summary_table);
            $('.mop').hide();
        },
        error: function(err){
            console.log(err);
            app.dialog.close();
            $('#transaction_row').html('<tr><td colspan="4"></td>ERROR</td></tr>');
        }
    });

}
/*https://www.npmjs.com/package/cesarbalzer-cordova-plugin-btprinter*/
function loadPrinters(){
    BTPrinter.list(function(data){
        console.log("Success");
        console.log(data); // paired bluetooth devices array

        jQuery.each(data, function (idx, value) {
            /* Add devices (array contains device name every 3 array elements) */
            console.log(idx);
            console.log(value);
            if (idx % 3 === 0) {
                $("#btpPrinter").append('<option value="' + idx + '" data-name="' + data[idx] + '" data-macadd="' + data[idx + 1] + '">' + data[idx] + ' (' + data[idx + 1] + ')</option>');
            }
        });

    },function(err){
        console.log("Error");
        console.log(err);
    });
}
function connectPrinter(x){
    //console.log('connectPrinter ' + x);
    //console.log(x);
    //$('#btpPrinter').val(x);
    console.log('connectPrinter');
    $("#btpPrinter option[value='"+x+"']").prop('selected', true);
    var strPrinter = $("#btpPrinter option[value='"+x+"']").attr('data-name');
    console.log(strPrinter);
    window.setTimeout(function () {
        console.log('strPrinter ' + strPrinter);
        connectPrt(strPrinter);
    }, 100);
}
function connectPrt(strPrinter){
    window.setTimeout(function () {
        /* Use timeout to properly update GUI first */

        BTPrinter.connect(function (data) {
            console.log(data);
            console.log('connectPrt()');
            console.log(data);
            $('#status').html('<span class="success">' + data + '</span>');

            //$('#btnConnect').prop('disabled', false);
        }, function (err) {
            console.log(err);
            $('#status').html('<span class="error">' + err + '</span>');
            //$('#btnConnect').prop('disabled', false);
        }, strPrinter);
    }, 1000);
}
function Print(){
    if($("#btpPrinter").length  == 1){

        connectPrinter(0);
    }
    if($('#yesterday').val(1)){
        getTransactions(1);
    }
    else{
        getTransactions();
    }
    console.log('printing');

    var sprintText ='\n        ' + $('#mn').val() + '\n        '
        + $('#connected_user_name').val()
        + '\n        Transaction List !\n'; // For the printer
    sprintText += '\n-----------------------------------------\n';
    sprintText += '\n\n-----------------------------------------';
    sprintText += '\nSuccess:   ' + success_qty +' |  Rs.' + parseFloat(success_amt).toFixed(2);
    sprintText += '\nFailed:    ' + failed_qty +' |  Rs.' + parseFloat(failed_amt).toFixed(2);
    sprintText += '\nCancelled: ' + cancelled_qty +' |  Rs.' + parseFloat(cancelled_amt).toFixed(2);
    sprintText += '\nWaiting:   ' + waiting_qty +' |  Rs.' + parseFloat(waiting_amt).toFixed(2);
    sprintText += '\n-----------------------------------------';


    /*var strAlign= '0';
    var strSize = '00';*/
    sprintText += '\n';
    sprintText += '\n-----------------------------------------\n';
    /*sprintText += 'www.mips.mu';
    sprintText += '\n-----------------------------------------\n';*/

    sprintText += '\n'+$('#device_id').val()+'\n';

    console.log('printTransactionBtn -> sprintText -= ' + sprintText);

    BTPrinter.printText(function (data) {
        console.log(data);
        $('#status').html('<span class="success">' + data + '</span>');
    }, function (err) {
        console.log(err);
        $('#status').html('<span class="error">' + err + '</span>');
    }, sprintText);

    getTransactions();
}

function printLogo(){
    console.log('printLogo');

    BTPrinter.printBase64(function(data){
        console.log("Success");
        console.log(data);
    },function(err){
        console.log("Error");
        console.log(err);
    }, "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",'1');//base64 string, align
}

var linkSelectTransactionStatus = app.smartSelect.create({
    el: '.smart-select-init-status',
    openIn: 'popover',
    closeOnSelect: true,
});

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
    ].join('-');
}
function today_trans(){
    $('#yesterday').val(0);
    getTransactions(); //today
}
function yesterday(){
    const timeStamp = new Date().getTime();
    const yesterdayTimeStamp = timeStamp - 24*60*60*1000;
    const yesterdayDate = new Date(yesterdayTimeStamp);
    console.log(formatDate(yesterdayDate));
    console.log(new Date(new Date().getTime() - 24*60*60*1000));
    $('#yesterday').val(1);
    getTransactions(1); //1 = yes yesterday
}
/***********************/
/* Transaction end     */
/***********************/
/*
// Option 2. Using live 'page:init' event handlers for each page (not recommended)
$$(document).on('page:init', '.page[data-page="transactions"]', function (e) {
    // Do something here when page with data-page="about" attribute loaded and initialized
    console.log('PAGE TRANSACTIONS LOADED');
    //getTransactions();
})
*/
$$(document).on('page:init', '.page[data-name="transactions"]', function (e) {
    // Do something here when page with data-page="about" attribute loaded and initialized
    console.log('PAGE TRANSACTIONS LOADED, LOADING TRANSACTIONS  - ' + $('#statusTransactionFilter').val()); //option:selected
    if($('#is_printer_on').val() == 1)
    {
        loadPrinters();
        $('.printTransactionBtn-action-button').removeClass('not-activated');
        $('.btpPrinter-block').removeClass('not-activated');
    }
    getTransactions();
})

/*
  * TILL INTEGRATION ?
  * */
function checknewtransaction(event){
    console.log('checknewtransaction');

    //temporaire
    //$('#is_till_integration').val(1); // to revisit
    var id_merchant = $('#m').val();
    var id_form = $('#f').val();
    var id_user = $('#creator_id').val();
    var amount = $('#amount_to_pay').val();

    var formData = new FormData();

    formData.append('currency', 'MUR');
    formData.append('amount', amount);
    // formData.append('id_order', id_order);
    formData.append('m', id_merchant);
    formData.append('f', id_form);
    formData.append('creator_id', id_user);
    formData.append('for_till_id', $('#device_id').val());
    formData.append('remarks', $('#remarks').val());
    formData.append('status', 'Waiting');
    formData.append('connected_user_name', $('#connected_user_name').val());
    formData.append('is_till_integration',$('#is_till_integration').val());
    formData.append('ref', 'get_till_transaction');
    app.request({
        crossDomain: true,
        method: 'POST',
        url: mymipsURL+'mips-app/get-till-transaction.php',
        //url: 'https://my.mips.mu/mips-app/get-till-transaction.php',
        data: formData,
        dataType: 'json',
        success: function(data) {
            console.log(data);
            if(data.length) {
                var order = data[0];
                if (order.somme_totale) {
                    $('#amount_to_pay').val(parseFloat(order.somme_totale/100).toFixed(2));
                    $('#amount_to_pay').attr('disabled',true);
                    $('#o').val(order.id_commande_format_client);
                    $('#qr_check_order').val(order.id_commande_format_client);
                    //$('#remarks').val('Till Ref Id: ' + order.id_commande_format_client);
                    document.getElementById('audio-amount-ready').play();
                }
            }
            else{
                setTimeout(function () { checknewtransaction(); } ,5000);
            }

        },
        error: function (data, errorThrown){
            // app.dialog.close();
            console.log(data);
            console.log(errorThrown);
            app.dialog.alert('An error has occurred',function (){
                resetForm();
            });
        }

    });
    //setTimeout(function () { checknewtransaction(); } ,3000);
}