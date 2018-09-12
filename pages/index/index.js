//index.js
//获取应用实例
var table = require("../../utils/table.js");
const app = getApp()
Page({
  data: {
    name: "",
    innerAudioContext: null,
    playStatus: true,
    musicAnimation: null,
    interval: null,
    n: 0,
    isShow: false,
    albumid: "",
    fileCount:0,
    currentFile: 0,
    fileTotal: 0,
    imageList:[],
    isLike:false
  },
  onLoad: function(option) {
    this.setData({
      albumid: option.albumid
    });
    //this.createAnimation();
    //this.startAnimation();
    //setTimeout(this.initMusicPlayer.bind(this), 1000);
  },
  onShow: function() {
    this.getImageData();
  },
  onHide: function() {
    //this.clearAnimation();
    //this.stopAnimation();
  },
  onUnload:function(){
  
  },
  bindName: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  uploadFile: function(filePathList,cb) {
    var self=this;
    this.setData({
      fileTotal: filePathList.length
    });
    filePathList.forEach(file => {
      let MyFile = new wx.BaaS.File()
      let fileParams = {
        filePath: file
      }
      let metaData = {
        categoryName: 'SDK'
      };
      MyFile.upload(fileParams, metaData).then(res => {
        var {
          statusCode,
          data
        } = res;
        if (statusCode == 200) {
          let tableId = table.image.id;
          let Images = new wx.BaaS.TableObject(tableId);
          let image = Images.create();
          image.set({
            url: data.path,
            albumid: this.data.albumid
          }).save().then(res=>{
            var current = ++self.data.fileCount;
            self.setData({
              fileCount: current,
              percent: Math.floor(current / this.data.fileTotal * 100)
            });
            if (self.data.fileCount == self.data.fileTotal) return cb(data.path);
          });
        } else {

        }
      }, err => {

      });
    })
  },
  playVocice: function() {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = 'https://cloud-minapp-19585.cloud.ifanrusercontent.com/1fzLX7pigCLDhpdO.mp3'
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  uploadMyFile: function() {
    const backgroundAudioManager = wx.getBackgroundAudioManager()

    backgroundAudioManager.title = '此时此刻'
    backgroundAudioManager.epname = '此时此刻'
    backgroundAudioManager.singer = '许巍'
    backgroundAudioManager.coverImgUrl = 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000'
    backgroundAudioManager.src = 'https://cloud-minapp-19585.cloud.ifanrusercontent.com/1fzLX7pigCLDhpdO.mp3' // 设置了 src 之后会自动播放
  },
  operateMusicPlayer: function() {
    var status = this.data.innerAudioContext.paused;
    this.setData({
      playStatus: !status
    })
    if (status) {
      this.stopAnimation();
      this.data.innerAudioContext.pause();
    } else {
      this.startAnimation();
      this.data.innerAudioContext.play();
    }
  },
  initMusicPlayer: function() {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = true;
    innerAudioContext.src = "https://cloud-minapp-19585.cloud.ifanrusercontent.com/1fzLX7pigCLDhpdO.mp3";
    this.setData({
      innerAudioContext: innerAudioContext
    })
  },
  createAnimation: function() {
    //创建一个动画对象
    this.animation = wx.createAnimation({
      duration: 1400,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    })
  },
  rotateAni: function(n) {
    console.log("x", n);
    this.animation.rotate(180 * (n)).step()
    this.setData({
      musicAnimation: this.animation.export()
    })
  },
  startAnimation: function(isPlay = true) {
    var route = this.data.n;
    this.rotateAni(route);
    this.setData({
      n: ++route
    })
    var interval = setInterval(function() {
      var route = this.data.n;
      this.rotateAni(route);
      this.setData({
        n: ++route
      })
    }.bind(this), 1000);
    this.setData({
      interval: interval
    })
  },
  stopAnimation: function() {
    clearInterval(this.data.interval);
  },
  uploadPanel: function() {
    var self = this;
    var actionList = ["拍摄照片", "上传图片", "上传视频"];
    wx.showActionSheet({
      itemList: actionList,
      success: function(res) {
        self.handleAction(res.tapIndex);
      }
    })
  },
  handleAction: function(index) {
    //拍照上传
    if (index == 0) {

    }
    //从相册读取
    else if (index == 1) {
      this.handleImage();
    }
    //上传视频
    else if (index == 2) {

    } else {}
  },
  handleImage: function() {
    var self = this;
    var options = {
      count: 9,
      sourceType: ["album"],
      success: function(res) {
        self.uploadFile(res.tempFilePaths,self.saveCompleteHandler.bind(self));
      }
    }
    wx.chooseImage(options);
  },
  clearAnimation: function() {
    this.rotateAni(0);
    this.stopAnimation();
    this.setData({
      n: 0,
      interval: null,
      musicAnimation: null
    })
  },
  saveCompleteHandler:function(url){
     this.setData({
       fileCount: 0,
       currentFile: 0,
       fileTotal: 0
     })
    var AlbumTable = new wx.BaaS.TableObject(table.album.id);
    var record = AlbumTable.getWithoutData(this.data.albumid);
    record.set("firstUrl", url);
    record.update();
    this.getImageData();
  },
  getImageData:function(){
    var self=this;
    wx.showLoading({
      title: '加载中',
      success:function(){
        var ImageTable = new wx.BaaS.TableObject(table.image.id);
        var CommentTable = new wx.BaaS.TableObject(table.comments.id);
        var query = new wx.BaaS.Query();
        query.compare('albumid', '=', self.data.albumid);
        ImageTable.setQuery(query).orderBy('created_at').find().then(res => {
          self.setData({
            imageList: res.data.objects
          })
          wx.hideLoading();
        })
      }
    }) 
  },
  setLike:function(e){
    var id=e.target.id;
    this.setData({
      isLike: !this.data.isLike
    })
  },
	navigateCommentList:function(e){
		var url="../comment/comment?imageid="+e.target.id;
		wx.navigateTo({
			url
		})
	}
})