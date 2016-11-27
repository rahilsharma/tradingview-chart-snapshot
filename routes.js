app.post('/tvSnapshot',function(req,res){
        try {
            var dataObject = JSON.parse(req.body.images);
            var panelCount = dataObject.charts[0].panes.length;
            console.log(panelCount);
            var imgTotal = [];
            var totalHeight = 0;
            var totalWidth = 0;
            var fontPath = './arial.ttf';
            let x = 0;
            for (x = 0; x < panelCount; x++) {
                var panelZeroChartContent = dataObject.charts[0].panes[x].content.replace('data:image/png;base64,', '');
                var bufferPanelZero = new Buffer(panelZeroChartContent, 'base64');
                var panelZeroRightAxisContent = dataObject.charts[0].panes[x].rightAxis.content.replace('data:image/png;base64,', '');
                var bufferPanelZeroRightAxis = new Buffer(panelZeroRightAxisContent, 'base64');
                var imgPanelZero = gd.createFromPngPtr(bufferPanelZero);
                var imgPanelZeroRightAxis = gd.createFromPngPtr(bufferPanelZeroRightAxis);
                var heightEmptyImage = parseInt(dataObject.charts[0].panes[x].contentHeight);
                var widthEmptyImage = parseInt(dataObject.charts[0].panes[x].contentWidth) + parseInt(dataObject.charts[0].panes[x].rightAxis.contentWidth);
                var widthPanelZeroImage = parseInt(dataObject.charts[0].panes[x].contentWidth);
                var widthPanelZeroRightAxis = parseInt(dataObject.charts[0].panes[x].rightAxis.contentWidth);
                var heightPanelZeroRightAxis = parseInt(dataObject.charts[0].panes[x].rightAxis.contentHeight);
                var containsMainSeries = dataObject.charts[0].panes[x].containsMainSeries;
                var studies = dataObject.charts[0].panes[x].studies;
                totalHeight = totalHeight + parseInt(dataObject.charts[0].panes[x].contentHeight);
                totalWidth = widthEmptyImage;
                console.log(widthEmptyImage + " :: widthEmptyImage ");
                //making empty image here
                //widthEmptyImage = parseInt(widthEmptyImage);
                //heightEmptyImage = parseInt(heightEmptyImage);
                var tmpImg = gd.createTrueColorSync(widthEmptyImage, heightEmptyImage);
                imgPanelZero.copyMerge(tmpImg, 0, 0, 0, 0, widthPanelZeroImage, heightEmptyImage, 100);
                imgPanelZeroRightAxis.copyMerge(tmpImg, widthPanelZeroImage, 0, 0, 0, widthPanelZeroRightAxis, heightPanelZeroRightAxis, 100);
                if (containsMainSeries) {
                    //need to add text of main series
                    var mainSeriesText = dataObject.charts[0].panes[x].mainSeriesText;
                    // console.log("mainSeriesText" + mainSeriesText);
                    var color = tmpImg.colorAllocate(0, 0, 0);
                    tmpImg.stringFT(color, fontPath, 15, 0, 5, 22, mainSeriesText);
                }
                if (studies) {
                    var studiesLen = studies.length;
                    var xCordValue = 15;  //10 font + 5
                    if (containsMainSeries) {
                        xCordValue = 35;
                    }
                    for (var yyy = 0; yyy < studiesLen; yyy++) {
                        var studiesText = studies[yyy];
                        var color = tmpImg.colorAllocate(0, 0, 0);
                        tmpImg.stringFT(color, fontPath, 10, 0, 5, xCordValue, studiesText);
                        xCordValue = xCordValue + 20;
                    }
                }
                imgTotal.push(tmpImg);
            }
            //now we do our timeAxis
            //for now i am only covering the right hand stub
            var timeAxisContent = dataObject.charts[0].timeAxis.content.replace('data:image/png;base64,', '');
            var bufferTimeAxis = new Buffer(timeAxisContent, 'base64');
            var imgTimeAxis = gd.createFromPngPtr(bufferTimeAxis);
            var heightTimeAxis = parseInt(dataObject.charts[0].timeAxis.contentHeight);
            var widthTimeAxis = parseInt(dataObject.charts[0].timeAxis.contentWidth);
            var rhsStubContent = dataObject.charts[0].timeAxis.rhsStub.content.replace('data:image/png;base64,', '');
            var bufferRhsStub = new Buffer(rhsStubContent, 'base64');
            var imgRhsStub = gd.createFromPngPtr(bufferRhsStub);
            var rhsStubWidth = parseInt(dataObject.charts[0].timeAxis.rhsStub.contentWidth);
            var rhsStubHeight = parseInt(dataObject.charts[0].timeAxis.rhsStub.contentHeight);
            //now create another empty image that will merge all the images
            //height === total height
            //width ==== total width
            // console.log(totalHeight + " :: totalheight");
            // console.log(totalWidth + " :: totalwidth");
            totalHeight = totalHeight + heightTimeAxis;
            totalHeight = totalHeight + 20;
            var bigImage = gd.createTrueColorSync(totalWidth, totalHeight);
            //add talkoot.in to the top
            var talkootImage = gd.createTrueColorSync(totalWidth, 20);
            var colorTalkoot = talkootImage.colorAllocate(0, 0, 0);
            var backgroundColor = talkootImage.colorAllocate(255, 255, 255);
            talkootImage.filledRectangle(0, 0, totalWidth, 20, backgroundColor);
            talkootImage.stringFT(colorTalkoot, fontPath, 10, 0, 5, 14, "Published on Talkoot.in ," + new Date().toString());
            talkootImage.copyMerge(bigImage, 0, 0, 0, 0, talkootImage.width, talkootImage.height, 100);
            //
            var tmpHeightToConsider = 20;
            //  console.log(imgTotal.length + " :: this is our length");
            for (var xxx = 0; xxx < imgTotal.length; xxx++) {
                if (xxx == 0) {
                    console.log("came in 0");
                    imgTotal[xxx].copyMerge(bigImage, 0, 20, 0, 0, imgTotal[xxx].width, imgTotal[xxx].height, 100);
                }
                else {
                    console.log("came in non 0");
                    imgTotal[xxx].copyMerge(bigImage, 0, tmpHeightToConsider, 0, 0, imgTotal[xxx].width, imgTotal[xxx].height, 100);
                }
                tmpHeightToConsider = tmpHeightToConsider + imgTotal[xxx].height;
                // console.log(tmpHeightToConsider + " :: tmpHeightToConsider");

            }
            imgTimeAxis.copyMerge(bigImage, 0, tmpHeightToConsider, 0, 0, widthTimeAxis, heightTimeAxis, 100);
            imgRhsStub.copyMerge(bigImage, widthTimeAxis, tmpHeightToConsider, 0, 0, rhsStubWidth, rhsStubHeight, 100);
            var dateToday = new Date().getTime();
            dateToday = dateToday.toString() + randomIntFromInterval(1, 100).toString() + randomIntFromInterval(1, 100).toString();
            bigImage.savePng(appRoot + '/resources/downloadedImages/' + dateToday + '.png', 9, function (error) {
                if (error) {
                    res.status(500).send(error);
                }
                var file = appRoot + '/resources/downloadedImages/' + dateToday + '.png';
                fs.readFile(file, function (err, data) {
                    //  console.log("reading file");
                    if (err) throw err; // Something went wrong!
                    var s3bucket = new AWS.S3({params: {Bucket: 'talkoot-users'}});
                    s3bucket.createBucket(function () {
                        var params = {
                            Key: dateToday + ".png", //file.name doesn't exist as a property
                            Body: data
                        };
                        s3bucket.upload(params, function (err, data) {
                            if (err) {
                                console.log('ERROR MSG: ', err);
                                res.status(500).send(err);
                            } else {
                                console.log("file uploaded successfully");
                                console.log(data);
                                if (data.Location) {
                                    res.send(data.Location);
                                }
                                else {
                                    res.status(500).send(err);
                                }
                            }
                        });
                    });
                    bigImage.destroy();
                });
            });
        }
        catch (ex){
            console.log(ex);
            res.status(500).send(ex);
        }
    })
