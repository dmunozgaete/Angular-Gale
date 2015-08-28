
//Package Bundle
angular.manifiest('gale', [
    'gale.directives',
    'gale.components',
    'gale.filters',
    'gale.services',
    'gale.services.security',
    'gale.services.configuration',
    'gale.services.rest',
    'gale.services.storage'
])

.run(function ($Configuration, $LocalStorage, $log, CONFIGURATION){
    var stored_key = "$_application";
    var app_conf  = CONFIGURATION.application;
    var app_stored = $LocalStorage.getObject(stored_key);

    if(app_stored){
        
        //check version configuration , if old , broadcast a changeVersion event;
        if(app_stored.version !== app_conf.version || app_stored.environment !== app_conf.environment){

            $log.debug("a new configuration version is available, calling [on_build_new_version] if exist's !", app_conf.version); //Show only in debug mode

            if(angular.isFunction(CONFIGURATION.on_build_new_version)){
                try{
                    CONFIGURATION.on_build_new_version(app_conf.version , app_stored.version);
                }catch(e){

                    $log.debug("failed to execute [on_build_new_version] function defined in config.js", e);
                    throw e;
                }
            }
        }
        
    }

    //Update
    $LocalStorage.setObject(stored_key, app_conf);

})

.config(function($mdIconProvider) {
    //Icons Set's (https://github.com/nkoterba/material-design-iconsets)
    var bundle_src = "bundles/gale/svg/icons/{0}-icons.svg";
    angular.forEach([
        "action", "alert", "av", "communication", "content",
        "device", "editor", "file", "hardware", "icons", "image",
        "maps", "navigation", "notification", "social", "toggle"
    ], function(toolset) {
        $mdIconProvider.iconSet(toolset, bundle_src.format([toolset]), 24);
    });
});


