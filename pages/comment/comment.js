// pages/comment/comment.ks
var comments = require("../../mock/comment.js");
var table = require("../../utils/table.js");
var util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageid: "",
    content: "",
    commentList: [],
    nickName: "",
    avatarUrl: "",
    total: 0,
    offset: 0,
    limit: 12
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    this.setData({
      imageid: options.imageid 
    });
    var self = this;
    wx.getUserInfo({
      success: function (res) {
        var {
          nickName,
          avatarUrl
        } = JSON.parse(res.rawData);
        self.setData({
          nickName,
          avatarUrl
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getCommentCount();
    this.getCommentList(true);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function(){

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom:function() {
    if(this.data.offset == this.data.total) return;
    this.getCommentList(false);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getCommentCount: function() {
    let CommentTable = new wx.BaaS.TableObject(table.comments.id);
    let query = new wx.BaaS.Query();
    query.compare('imageid', '=', this.data.imageid);
    CommentTable.setQuery(query).count().then(num => {
      this.setData({
        total: num
      });
    })
  },
  getCommentList: function(isFirst) {
    var self = this;
    wx.showLoading({
      title: "加载中",
      success: function() {
        let CommentTable = new wx.BaaS.TableObject(table.comments.id);
        let query = new wx.BaaS.Query();
        query.compare('imageid', '=', self.data.imageid);
        CommentTable.setQuery(query).orderBy('-created_at').limit(self.data.limit).offset(self.data.offset).find().then(res => {
          var array = res.data.objects;
          var offset = self.data.offset;
          //是否是首次加载
          if (!isFirst) {
            array = [...self.data.commentList, ...array];
          }
          var offset = self.data.offset;
          self.setData({
            commentList: array,
            offset: array.length
          })
          wx.hideLoading();
        })

      }
    })

  },
  writeComment: function(e) {
    this.setData({
      content: e.detail.value
    })
  },
  sendComment: function() {
    if (!this.data.content) return;
    var self = this;
    wx.showLoading({
      title: "留言中，请稍后",
      mask: true,
      success: function() {
        self.saveComment();
      }
    })
  },
  saveComment: function() {
    let CommentTable = new wx.BaaS.TableObject(table.comments.id);
		let ImageTable= new wx.BaaS.TableObject(table.image.id);
		var image= ImageTable.getWithoutData(this.data.imageid);
		image.incrementBy('commentTotal', 1)
    var comment = CommentTable.create();
    var self = this;
    var data = {
      imageid: self.data.imageid,
      content: self.data.content,
      commentType: 1,
      nickName: this.data.nickName,
      avatarUrl: this.data.avatarUrl,
      CrreatedTime: util.formatTime(new Date())
    }
    comment.set(data);
    comment.save().then(res => {
      var array = this.data.commentList;
      array = [res.data, ...array];
      self.setData({
        commentList: array,
        content: ""
      })
		  image.update().then(res=>{
				wx.hideLoading();
			})
    })
  }
})