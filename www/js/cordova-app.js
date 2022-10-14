let toastWithButton;

var cordovaApp = {
  f7: null,
  /*
  This method hides splashscreen after 2 seconds
  */
  handleSplashscreen: function () {
    var f7 = cordovaApp.f7;
    if (!window.navigator.splashscreen || f7.device.electron) return;
    setTimeout(() => {
      window.navigator.splashscreen.hide();
    }, 2000);
  },
  /*
  This method prevents back button tap to exit from app on android.
  In case there is an opened modal it will close that modal instead.
  In case there is a current view with navigation history, it will go back instead.
  */
  handleAndroidBackButton: function () {
    var f7 = cordovaApp.f7;
    const $ = f7.$;
    if (f7.device.electron) return;

    document.addEventListener(
      'backbutton',
      function (e) {
        if ($('.actions-modal.modal-in').length) {
          f7.actions.close('.actions-modal.modal-in');
          e.preventDefault();
          return false;
        }
        if ($('.dialog.modal-in').length) {
          //f7.dialog.close('.dialog.modal-in');
          e.preventDefault();
          return false;
        }
        if ($('.sheet-modal.modal-in').length) {
          //f7.sheet.close('.sheet-modal.modal-in');
          e.preventDefault();
          return false;
        }
        if ($('.popover.modal-in').length) {
          f7.popover.close('.popover.modal-in');
          e.preventDefault();
          return false;
        }
        if ($('.popup.modal-in').length) {
          if ($('.popup.modal-in>.view').length) {
            const currentView = f7.views.get('.popup.modal-in>.view');
            if (currentView && currentView.router && currentView.router.history.length > 1) {
              currentView.router.back();
              e.preventDefault();
              return false;
            }
          }
          f7.popup.close('.popup.modal-in');
          e.preventDefault();
          return false;
        }

        if ($('.login-screen.modal-in').length) {
          //f7.loginScreen.close('.login-screen.modal-in');
          e.preventDefault();
          return false;
        }

        if ($('.page-current .searchbar-enabled').length) {
          f7.searchbar.disable('.page-current .searchbar-enabled');
          e.preventDefault();
          return false;
        }

        if ($('.page-current .card-expandable.card-opened').length) {
          f7.card.close('.page-current .card-expandable.card-opened');
          e.preventDefault();
          return false;
        }

        const currentView = f7.views.current;
        if (currentView && currentView.router && currentView.router.history.length > 1) {
          currentView.router.back();
          e.preventDefault();
          return false;
        }

        if ($('.panel.panel-in').length) {
          f7.panel.close('.panel.panel-in');
          e.preventDefault();
          return false;
        }
      },
      false,
    );
  },
  /*
  This method does the following:
    - provides cross-platform view "shrinking" on keyboard open/close
    - hides keyboard accessory bar for all inputs except where it required
  */
  handleKeyboard: function () {
    var f7 = cordovaApp.f7;
    if (!window.Keyboard || !window.Keyboard.shrinkView || f7.device.electron) return;
    var $ = f7.$;
    window.Keyboard.shrinkView(false);
    window.Keyboard.disableScrollingInShrinkView(true);
    window.Keyboard.hideFormAccessoryBar(true);
    window.addEventListener('keyboardWillShow', () => {
      f7.input.scrollIntoView(document.activeElement, 0, true, true);
    });
    window.addEventListener('keyboardDidShow', () => {
      f7.input.scrollIntoView(document.activeElement, 0, true, true);
    });
    window.addEventListener('keyboardDidHide', () => {
      if (document.activeElement && $(document.activeElement).parents('.messagebar').length) {
        return;
      }
      window.Keyboard.hideFormAccessoryBar(false);
    });
    window.addEventListener('keyboardHeightWillChange', (event) => {
      var keyboardHeight = event.keyboardHeight;
      if (keyboardHeight > 0) {
        // Keyboard is going to be opened
        document.body.style.height = `calc(100% - ${keyboardHeight}px)`;
        $('html').addClass('device-with-keyboard');
      } else {
        // Keyboard is going to be closed
        document.body.style.height = '';
        $('html').removeClass('device-with-keyboard');
      }
    });
    $(document).on(
      'touchstart',
      'input, textarea, select',
      function (e) {
        var nodeName = e.target.nodeName.toLowerCase();
        var type = e.target.type;
        var showForTypes = ['datetime-local', 'time', 'date', 'datetime'];
        if (nodeName === 'select' || showForTypes.indexOf(type) >= 0) {
          window.Keyboard.hideFormAccessoryBar(false);
        } else {
          window.Keyboard.hideFormAccessoryBar(true);
        }
      },
      true,
    );
  },
  init: function (f7) {
    // Save f7 instance
    cordovaApp.f7 = f7;

    document.addEventListener('deviceready', () => {
      // Handle Android back button
      cordovaApp.handleAndroidBackButton();

      // Handle Splash Screen
      cordovaApp.handleSplashscreen();

      // Handle Keyboard
      cordovaApp.handleKeyboard();


        if(networkInfo() == 0){
            f7.dialog.alert('No Connection - You are Offline');
        }
        else {
        f7.dialog.preloader('Please wait', 'default');

        UARTautoDetect();

        //init database
        initDatabase();
        }

    });

      document.addEventListener("offline", onOffline, false);
      document.addEventListener("online", onOnline, false);

    // Initialize incoming SMS event listener
    document.addEventListener('onSMSArrive', function(e) {
         var sms = e.data;
         reviewSms(sms);
      });


    document.addEventListener('trigger_sms_action', function(e){
            console.log(e.detail)
            console.log(e.detail.action)
            sms_process(e.detail.action);
    });

      document.addEventListener('deviceready', function () {

          new Promise(function (resolve) {

              bluetoothle.initialize(resolve, { request: true, statusReceiver: false });

          }).then(initializeSuccess, handleError);

      });

  },
};

function networkInfo() {
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
    console.log('Connection type: ' + states[networkState]);
    if(states[networkState] === "No network connection"){
        // app.dialog.alert('Connection type: ' + states[networkState],'Network Info');
        return 0;
    }
    return 1;
}

function onOffline() {

    const showToastWithButton = () => {
        // Create toast
        if (!toastWithButton) {
            toastWithButton = app.toast.create({
                text: 'You are now offline',
                position: 'top',
                closeButton: false,
            });
        }
        // Open it
        toastWithButton.open();
    }
    showToastWithButton();
    console.log('You are now offline!');
}

function onOnline() {

    toastWithButton.close();


    //app.dialog.alert('You are now online!','Network');
    console.log('You are now online!');
}


function sms_process(action){
    switch(action){

        case 'sync':
            // Filtering on inbox and MCB messages only
            var filter = {
                box : 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all

                // following 4 filters should NOT be used together, they are OR relationship
                // read : 1, // 0 for unread SMS, 1 for SMS already read        		indexFrom : 0, // start from index 0
                address:'MCB',


                //address:'MIPS',   ///  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< change to MCB
                maxCount : 15, // count of SMS to return each time
            };
            if(SMS) SMS.listSMS(filter, function(data){
                console.log( (data) );

                //SEND REQUEST TO MYMIP - to trigger Order Status updates  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  TO DO!

                var id_merchant = $('#m').val();
                var id_form = $('#f').val();
                var id_user = $('#creator_id').val();
                var device_id = $('#device_id').val();

                var sms_bulk = JSON.stringify(data);


                var formData = new FormData();
                formData.append('sms_bulk', sms_bulk);
                formData.append('f', id_form);
                formData.append('m', id_merchant);
                formData.append('device_id', device_id);
                formData.append('id_user', id_user);

                app.dialog.preloader('Loading, please wait', 'color-green');

                app.request({
                    crossDomain: true,
                    method: 'POST',
                    url: mymipsURL+'mips-app/sms_bulk_payment_update.php',
                    data: formData,
                    dataType: 'json',
                    success: function (data) {
                        if (data.result == 'process_complete'){
                            // updating transaction process complete trigger reload
                            app.dialog.close();
                            getTransactions();

                        }
                    },
                    error: function (data, errorThrown) {
                        console.log(data,errorThrown);
                    },
                    statusCode: {
                        404: function (xhr) {                        //
                            console.log('404 error');
                        }
                    }
                });//

            }, function(err){
                console.log('error list sms: ' + err);
            });
            break;
    }
}


function init_SMS_action(action=null){
    let permissions = cordova.plugins.permissions;

    permissions.checkPermission(permissions.READ_SMS,  function(status){
        console.log(status);
        if ( status.hasPermission ) {
            if(action != null)
            {
                switch(action){
                    case 'sync':
                        document.dispatchEvent(new CustomEvent("trigger_sms_action", { 'detail':
                                {action: 'sync'}
                        }));
                        break;
                }
            }
        }
        else{
            permissions.requestPermission(permissions.READ_SMS, function(status){
                console.log(status);
                if ( status.hasPermission ) {
                    if(action != null)
                    {
                        switch(action){
                            case 'sync':
                                document.dispatchEvent(new CustomEvent("trigger_sms_action", { 'detail':
                                        {action: 'sync'}
                                }));
                                break;
                        }
                    }
                }
                else{
                    //error message
                }

            }, function(){
                //error message
            });

        }
    }, function(){});
}

function update_payment_qr(id_order,amount_in_cents,image=null) {
    console.log('call update payment qr');
    app.dialog.preloader('Please wait...', 'default');

    var id_merchant = $('#m').val();
    var id_form = $('#f').val();
    var id_user = $('#creator_id').val();

    const byteCharacters = atob(image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'image/jpeg'});


    var formData = new FormData();
    formData.append('amount', amount_in_cents);
    formData.append('id_order', id_order);
    formData.append('m', id_merchant);
    formData.append('f', id_form);
    formData.append('id_user', id_user);
    formData.append('proof_image', blob);

    let max_try = 3;
    let trial_count = 0;
    let check_status = 'in_progress';
    let interval_update = 3000;

    window.update_qr_status = setInterval(function()
    {
        if (trial_count < max_try && check_status.toLowerCase() !== 'success') {
            trial_count++;
            app.request({
                async:false,
                crossDomain: true,
                method: 'POST',
                url: mymipsURL+'mips-app/update_qr_payment.php',
                data: formData,
                dataType: 'json',
                success: function (data) {
                    console.log(data);
                    if(data.result.toLowerCase() == "success" || data.result.toLowerCase() == "already paid"){
                        check_status = 'success';
                        clearInterval(window.update_qr_status);
                        app.dialog.close();
                        app.sheet.close('.merchant-qr-sheet');
                        document.getElementById('audio-payment-success').play();
                        /*app.dialog.alert('Payment Successful','Success',function (){
                            resetForm();
                        });*/
                        displayGeneralSuccessMSG();
                    }
                    else
                    {
                        if(trial_count == 3)
                        {
                            app.dialog.close();
                            app.dialog.alert('An error has occured while trying to update the order. Please try again.','Error');
                        }
                    }
                },
                error: function (data, errorThrown) {
                    console.log(data,errorThrown);
                    clearInterval(window.update_qr_status);
                    app.dialog.close();
                    app.sheet.close('.merchant-qr-sheet');
                    app.dialog.alert('An error has occurred',function (){
                        resetForm();
                    });
                }
            });//

        } //if
    }, interval_update)

}//f

function check_qr_order_status(id_order,id_form){
    var interval = 3000;
    window.checking_qr_status= setInterval(function () {
        var formData = new FormData();
        formData.append('f', id_form);
        formData.append('id_order', id_order);
        app.request({
            crossDomain: true,
            method: 'POST',
            url: mymipsURL+'mips-app/get_qr_pop_payment_status.php',
            //url: 'https://my.mips.mu/mips-app/get_qr_pop_payment_status.php',
            data: formData,
            dataType: 'json',
            success: function (data) {
                if (data.order_status === 'SUCCESS'){
                    // stopp function
                    stop_qr_order_verification();
                    app.sheet.close('.merchant-qr-sheet');
                    document.getElementById('audio-payment-success').play();
                    /*app.dialog.alert('Payment Successful','Success',function (){
                        resetForm();
                    });*/
                    displayGeneralSuccessMSG();
                }
                else if(data.order_status === 'FAIL'){
                    stop_qr_order_verification();
                    app.sheet.close('.merchant-qr-sheet');
                    //document.getElementById('audio-payment-success').play();
                    displayGeneralFailMSG();
                }
            },
            error: function (data, errorThrown) {
                console.log('error '+ window.checking_qr_status);
            },
            statusCode: {
                404: function (xhr) {                        //
                    console.log('404 error');
                }
            }
        });//
          }, interval);
}


function stop_qr_order_verification(){
    clearInterval(window.checking_qr_status)
}