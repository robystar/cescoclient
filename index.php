<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>R3 Urbantools</title>

    <link rel="stylesheet" type="text/css" href="extjs/resources/css/ext-all-gray.css">
    <link rel="stylesheet" type="text/css" href="resources/css/color-style.css" />
    <link rel="stylesheet" type="text/css" href="resources/css/style.css" />
    <script src="extjs/ext-all-dev.js"></script>
    <script src="locale/ext-lang-it.js"></script>
    
    <link rel="stylesheet" type="text/css" href="lib/ux/css/CheckHeader.css">
    <link rel="stylesheet" type="text/css" href="resources/css/example.css" />
    <link rel="stylesheet" type="text/css" href="resources/css/tab-image-view.css" /> <!-- A Gloria: cosa è questo? Intanto messi nello style inline, trovare una soluzione. A Francesco: è lo stile delle immagini nel tab-->
    
    <!-- MAP JS -->
    <link rel="stylesheet" href="resources/openlayers/theme/defaut/style.css" type="text/css">
    <script src="openlayers/OpenLayers.js"></script>
    <script src="geoext2/src/GeoExt/GeoExt.js"></script>
    
    <!--<script src="extjs/ext-all-debug-w-comments.js"></script>-->
    <!--Application JS-->
    <script src="urbantools.js"></script>
    <script type="text/javascript">
    OpenLayers.ImgPath = "resources/openlayers/img/";
    var R3AppConfig = <?php echo json_encode($appConfig); ?>;
    
    var R3UrbantoolsGlobals = {
        readerConfig: {
            type: 'json',
            root: 'data',
            totalProperty: 'total'
        }
    };
    </script>
    
</head>
<body>
<div id="loading-mask"></div>
<div id="loading">
    <span id="loading-message">R3 Urbantools sta caricando...</span>
</div>

<div id="loading-map"><span>Loading...</span></div>

</body>
</html>