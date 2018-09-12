var table=require("../../utils/table.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowAddAlbum:false,
    fadeIn:null,
    fadeOut:null,
    name:"",
    albumList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAlbumList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAlbumList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  tapAddAlbum:function(e){
    this.setData({
      isShowAddAlbum:true
    })
  },
  tap:function(e){
    if (this.data.isShowAddAlbum){
      this.setData({
        isShowAddAlbum: false
      })
    }
  },
  //淡入淡出效果
  fadeIn:function(){
		var animationOption={
      duration: 500,
      timingFunction:"ease"
		};
		var animation=wx.createAnimation(animationOption);
    animation.bottom("0").step();
		this.setData({
      fadeIn:animation.export()
		})
  },
	fadeOut:function(){
		var animationOption={
      duration: 500,
			timingFunction:"ease"
		};
		var animation=wx.createAnimation(animationOption);
		animation.bottom("-50%").step();
		this.setData({
			fadeIn:animation.export()
		})
	},
  checkboxChange:function(){

  },
  albumName:function(value){
    this.setData({
      name:value.detail.value
    })
  },
  createAlbum:function(){
    if (!this.data.name){
      return wx.showToast({
        title:"请输入相册名称！",
        duration:1500,
        icon:"none"
      })
    }
    this.saveAlbum();
  },
  saveAlbum:function(){
    var AlbumTable = new wx.BaaS.TableObject(table.album.id);
    var album = AlbumTable.create();
    album.set({
      name:this.data.name
    });
    album.save().then(res=>{
      var url = "../index/index?albumid=" + res.data.id.toString();
      wx.navigateTo({
        url: url
      })
    },err=>{

    });
  },
  getAlbumList:function(){
    let AlbumTable = new wx.BaaS.TableObject(table.album.id); 
    AlbumTable.orderBy('-created_at').find().then(res=>{
        this.setData({
          albumList:res.data.objects
        })
    })
  },
  toAlbum:function(e){
    var url = "../index/index?albumid=" + e.currentTarget.dataset.id;
    wx.navigateTo({
      url: url
    })
  }
})