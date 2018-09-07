//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    name: "",
    innerAudioContext: null,
    playStatus: true,
    musicAnimation: null,
    interval: null,
    n: 0,
    isShow:false
  },
  onLoad: function() {
    
  },
  onShow: function() {
    this.createAnimation();
    this.startAnimation();
    setTimeout(this.initMusicPlayer.bind(this), 1000);
  },
  onHide:function(){
    this.stopAnimation();
    this.setData({
      n: 0
    })
  },
  bindName: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  uploadFile: function() {
    var option = {
      count: 9,
      success: function(res) {
        res.tempFilePaths.forEach(file => {
          let MyFile = new wx.BaaS.File()
          let fileParams = {
            filePath: file
          }
          let metaData = {
            categoryName: 'SDK'
          };
          MyFile.upload(fileParams, metaData).then(res => {
            console.log(res);
            var {
              statusCode,
              data
            } = res;
            if (statusCode == 200) {
              let tableId = "49944";
              let Images = new wx.BaaS.TableObject(tableId);
              let image = Images.create();
              var {
                cdn_path,
                created_at,
                id,
                mime_type,
                name,
                size
              } = data.file;
              image.set({
                url: data.path.replace("https", "http"),
                fileid: id,
                cdn_path,
                filecreated_at: created_at,
                mime_type,
                filename: name,
                size
              }).save().then(() => {
                console.log("保存成功！");
              })
            } else {

            }
          }, err => {

          });
        })
      },
      fail: function() {

      },
      complete: function() {

      }
    };
    wx.chooseImage(option);
  },
  playVocice: function() {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = 'http://cloud-minapp-19585.cloud.ifanrusercontent.com/1fvdPLrTIvoEJwpS.mp3'
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
    backgroundAudioManager.src = 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46' // 设置了 src 之后会自动播放
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
    innerAudioContext.src = "https://cloud-minapp-19585.cloud.ifanrusercontent.com/1fvdPLrTIvoEJwpS.mp3";
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
    console.log(n);
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
  uploadPanel:function(){
    this.setData({
      isShow: !this.data.isShow
    })
  }
})