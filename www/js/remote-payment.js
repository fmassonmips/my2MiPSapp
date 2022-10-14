var $$ = Dom7;

/***********************/
/* Remote Payments     */
/***********************/
function createPaymentTicket(){
    app.dialog.preloader('Processing', 'default');
    //console.log('createPaymentTicket()');
    $('.payment-list-block').hide();
    var formData = new FormData();
    formData.append('ref', 'process_app_create_payment');
    formData.append('amount', $('#amount_to_pay_r').val());
    formData.append('m', $('#m').val());
    formData.append('s', $('#s').val());
    formData.append('c', $('#c').val());
    formData.append('f', $('#qp_form').val());
    formData.append('o', $('#o').val());
    formData.append('op_id', $('#op_id').val());
    formData.append('r_pwd', $('#r_pwd').val());
    formData.append('ticket_email', $('#ticket_email').val());
    formData.append('creator_email', $('#creator_email').val());
    formData.append('creator_id', $('#creator_id').val());
    formData.append('ticket_phone', $('#ticket_phone').val());
    formData.append('qp_first_name', $('#qp_first_name').val());
    formData.append('qp_last_name', $('#qp_last_name').val());
    formData.append('ticket_short_desc', $('#ticket_short_desc').val());

    app.request({
        crossDomain: true,
        method: 'POST',
        url: mymipsURL+'mips-app/create-payment-ticket.php',
        data: formData,
        dataType: 'json',
        success: function(data) {
            app.dialog.close();
            //
            //var response = JSON.parse(data);
            if(data.operation_status === 'success')
            {
                console.log(data);
                app.dialog.alert('Remote payment request created','Remote Payment sent',function (){
                    //resetForm();
                    console.log(data.payment_link);
                    let remote_qr_code_src = data.payment_link.qr_code;
                    console.log(data.payment_link.qr_code);
                    $('.block-qr-remote-payment').removeClass('not-activated');
                    $('.qr-remote-payment-img').attr('src',remote_qr_code_src);
                    app.sheet.open('.merchant-remote-payment-qr-sheet');
                    //{"operation_status":"success","operation_details":"","payment_link":{"url":"https:\/\/dev722quickpay.mips.mu\/quickpay.php?p=b0f36285ea833619","qr_code":"data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAATgAAAE4CAMAAAD4oR9YAAAA\/1BMVEX\/\/\/8AAABlZWUJCQlNTU2ioqLm5ub+\/v4vLy9\/f3+WlpYCAgLS0tJeXl6cnJyRkZH8\/PxwcHABAQGpqano6Oivr6\/MzMzT09NoaGiBgYHf398iIiIGBgYZGRkPDw98fHy\/v7+urq6fn589PT1ycnIcHByMjIxfX1+ZmZmPj4\/g4OCLi4shISE\/Pz8mJiZvb28fHx9PT0\/Y2Ng6OjoQEBDt7e2YmJjPz88TExO9vb0NDQ1XV1eGhob4+Pje3t6AgICNjY07Ozvv7+9TU1OdnZ1LS0srKyvLy8suLi7s7OxGRkZZWVmQkJD6+vpKSkp7e3unp6cdHR20tLRtbW0yMjJhpaDPAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFG0lEQVR42u3XZ1vbMBSGYZtOuhfdpemkE9JJ9957\/f\/fUqyQOortnnMkc2FHz\/uhRrJ0JN1ipFlGCCGEEEIIIYQQQgghhBBCCCEkKHlgpDrT\/W3tU+pv6zzAAQcccMABBxxwfYELHS+BSfWlg2jnt3Ue4IADDjjggAMOuL7CWQ8SunAuJPbC2roY4IADDjjggAMOuFmH024gFkhaBzjggAMOOOCAAw64sIWsB5RiBQQOOOCAAw444IBLFS50vPUg2oNa99nWeYADDjjggAMOOOD6AmdNLMxGt0PPAxxwwAHXBRjggOtWG7iuwsVGu\/Gm99q61vedD3DAAdeLAAcccL1IsnDWDTRBWMdZwSV467xoeOCAAw444IADDriOwGkBYuvHwmj3vWFgwAEHHHDAAQcccB2Bi92wNN56ACuoND8UHDjggAMOOOCAA64vcG1vIHS+Fib0goEDDjjggAMOOOBmBc66gPa9BKmFtl6MFSQYEDjggAMOOOCAA64jcNIGpANY32svJLSu9qKAAw444IADDjjgZgWuLVgJYqMuJnYccMABVzsLOAucYR\/A+XPmtmzdth04M1y1hniK5OBq5\/jtHYaddhYutLBt3njMTvecL1\/sGr3ZPTF2z17NxYaCBQN2AW6f69s\/Nf3AwUOKgrMKd7h210f85kLNuSo9h9KCyzU5Wu06Vi2SFNzx8ssTeWXg+Ef15OSU0df7vbXTgztVU+F0Be5A8c+Z8fvFolX8QTibZYPR\/HPJweX\/PqQVj\/N5fiHzPqmM4LL1CRcdlmtdyssPMuvPBOEmj3+5GW6peFzxtiTvZNPgJEjtBurGTcFdLTsX6+AmJrlcq4OT1rV+A\/QB7nrZeUMDl\/v10oWbLx6LrnlTBbdefDl1uJXiMXTNWzq4fJureTtxOPfLf9k1V5Rwa7mzVuBu2nDu22yna857cPf+Bzf1cSRZuJuued+DW50Ae1CWGA6HwBVP9xfhlmsueHAPS7hH\/hZ6BCeB2UC94zulx6458ODOj+GeFHOejkvMZdmzUYHnVbimfVn32Qc494O35JonPbgXk4VfFo2hv5ZfMU24Fdd85cGtVFxejx4D1zeYqpgcnPt\/1rxrvvHg3uYT41x2VQsupAanTZa9KxvvK6+3qNabdTi\/\/8P6hMZVPq5q15sZuE9Tve8+fxl8zb55fd\/HE1THSASuPieKAcs\/\/lOh7O4snLaQtHD4bn7WToy9qCZQLfTmwtXXaWhkr379\/vNvEnBCHWlfwEkHAC4QTnkg4IADDrgQuNiNad9LB5DW1dbXXrgZDDjggAMOOOCAA65jcFJha792XlsHjL0I4IADDjjggAMOuL7CNbW146yA1otpaz+tAQIHHHDAAQcccMB1FE7q1wKFQlvratdrDRA44IADDjjggAOuY3Da99oNW+FDL9oKDxxwwAEHHHDAATcrcE0bCoXRjrfuSwsiQUUDAgcccMABBxxwwG0yXGysYLEHDoWV1gUOOOCAAw444IDrG5z1ANaNtjVOApCgrODAAQcccMABBxxwfYHbqPGhB9WCaS\/SOg844IADDjjggAOub3DajWtBpfqhsFoY63rAAQcccMABBxxwwIW9D70AKwxwwAEHHHDAAQcccLr6bUcCAA444IADDjjggEsNru3xoRuOvTgtfHCAAw444IADDjjgOgJnTegBYw+knSftJxoQOOCAAw444IADbpPhCCGEEEIIIYQQQgghhBBCCCGEuPwFuBehUG6Ft0oAAAAASUVORK5CYII="}}
                });
            }
            else{
                app.dialog.alert('An error  has occured','Error',function (){
                    //resetForm();
                });
            }
            //app.views.main.router.navigate('/', {reloadCurrent: true});
            //app.sheet.close('.payment-ticket-details'); n'existe plus
            //app.router.navigate('/', { transition: 'f7-cover' })
            $('#reset-btn').click();
        },
        error: function (data, errorThrown){
            app.dialog.close();
            console.log(data);
            console.log(errorThrown);
            app.dialog.alert('An error has occurred',function (){
                //resetForm();
                //app.views.main.router.navigate('/', {reloadCurrent: true});
                $('#reset-btn').click();
            });
        }
    });

}

function getPaymentTicket(){
    $('.payment-list-block').show();
    var formData = new FormData();
    formData.append('ref', 'get_payment_tickets');
    formData.append('f', $('#qp_lform').val());
    formData.append('m', $('#m').val());
    formData.append('creator_email', $('#creator_email').val());
    formData.append('creator_id', $('#creator_id').val());
    formData.append('status', $('#statusFilter').val());
    app.request({
        crossDomain: true,
        method: 'POST',
        url: mymipsURL+'mips-app/get-payment-ticket.php',
        data: formData,
        dataType: 'json',
        success: function(data) {

            //var payments = JSON.parse(data);
            var pending_payment_table= '<div class="list">\n' +
                '        <ul>\n' ;
            jQuery.each(data, function( index, value ) {
                var status_class = '';
                //console.log(value);
                var qp_status = value.qp_statut_paiement;
                if(qp_status == 'Waiting'){
                    status_class = 'orange';
                }
                if(qp_status == 'Failed' || qp_status == 'Fail' || qp_status == 'FAIL'){
                    status_class = 'red';
                }
                if(qp_status == 'Success' ||qp_status == 'SUCCESS'  ){
                    status_class = 'green';
                }
                pending_payment_table +=
                    '<li>\n' +
                    '<a href="#" class="item-link item-content">\n' +
                    '  <div class="item-inner item-cell">\n' +
                    '	<div class="item-row">\n' +
                    '	  <div class="item-cell qp_titre">' + value.qp_titre + '</div>\n' +
                    '	  <div class="item-cell rp-item-title">\n' +
                    '      <div class="rp-item-header"><b>' + value.qp_date_ajouter + '</b></div>Rs. ' + value.qp_amount + '\n' +
                    '   </div>\n' +
                    '	  <div class="rp-item-after ' + status_class + '">'+qp_status+'</div>\n' +
                    '	</div>\n' +
                    '  </div>\n' +
                    '</a>\n' +
                    '</li>';

            });

            pending_payment_table +=
                '  </ul>\n' +
                '</div>';
            $('.payment-list-block').html(pending_payment_table);
            //$('.payment-list-block').focus();
        }
    });

    $('#statusFilter').on('change', function(){
        console.log('PAGE REMOTE PAYMENTS LOADED TO DISPLAY CREATED TICKETS WITH THE NEW STATUS => ' + $('#statusFilter').val()); //option:selected
        getPaymentTicket();
        //
        $('.smart-select-popover').removeClass('modal-in');
        $('.payment-list-block').focus();
        $('.smart-select-popover').removeClass('backdrop-in');
    });
}
$$('.smart-select-init').on('click', function () {
    var clickedLink = this;
    app.popover('.smart-select-init', clickedLink);
    console.log(clickedLink);

});

$('.block-qr-remote-payment-sheet-close').on('click',function(e){
    app.sheet.close('.merchant-qr-sheet');
});

$$(document).on('page:init', '.page[data-page="payments-repors"]', function (e) {
    // Do something here when page with data-page="about" attribute loaded and initialized
    console.log('PAGE REMOTE PAYMENTS LOADED');

})

$$(document).on('page:init', '.page[data-name="payments-repors"]', function (e) {
    // Do something here when page with data-page="about" attribute loaded and initialized
    console.log('PAGE REMOTE PAYMENTS LOADED TO DISPLAY CREATED TICKETS => ' + $('#statusFilter').val()); //option:selected
    getPaymentTicket();
    $('.smart-select-popover').removeClass('modal-in');
    $('.payment-list-block').focus();
    $('.smart-select-popover').removeClass('backdrop-in');
})

