module.exports = {
  bundle: [{
    type: "confirm",
    message: "是否使用打包工具？",
    name: "bundle",
  }],
  bundleType: [{
    type: 'list',
    message: '请选择打包方式:',
    name: 'bundleType',
    choices: [
      "Webpack",
      "Parcel"
    ],
    filter: function (val) { // 使用filter将回答变为小写
      return val.toLowerCase();
    }
  }],
  project: [
    {
      name: 'description',
      message: '请输入项目描述'
    },
    {
      name: 'author',
      message: '请输入作者名称'
    }
  ]
}