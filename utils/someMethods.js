// 判断参数是否为空
export function isEmpty(obj) {
	if (obj === undefined || obj === null) {
		return true;
	}
	if (typeof obj === 'string') {
		const trimmedObj = obj.trim();
		return trimmedObj === '' || trimmedObj === 'undefined' || trimmedObj === 'null';
	}
	return false;
}

// 判断一维对象内所有属性是否都不为空  true——都不为空
export function checkPropertiesEmpty(obj) {
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			const value = obj[key];
			if (
				value === null ||
				value === undefined ||
				value === 'null' ||
				value === 'undefined' ||
				value === 0 ||
				value === '0' ||
				value === ''
			) {
				return false;
			}
		}
	}
	return true;
}

// 判断对象中指定属性值是否含有空值 ——true含有空值
export function objIsEmpty(obj, arr) {
	let flag = false
  for (let i = 0; i < arr.length; i++) {
    let value = obj[arr[i]]
    if (value == null || value == undefined || value == '') {
			flag = true
			break
    }
  }
	return flag
}
// 格式化时间戳，将毫秒为单位的时间戳，转化为年-月-日的格式
export function formatDate(timestamp) {
  let date = new Date(timestamp)
  // 获取年、月、日
  let year = date.getFullYear()
  let month = date.getMonth() + 1 // 月份是从0开始的
  let day = date.getDate()
  // 格式化月份和日期，确保它们是两位数
  month = month < 10 ? '0' + month : month
  day = day < 10 ? '0' + day : day
  // 拼接成最终的日期格式
  let formattedDate = `${year}-${month}-${day}`
  return formattedDate
}

// 将时分秒格式的时间，加上分钟数后，返回计算后的时间
export function addMinutesTime(timeArr,theMinutes){
	// 初始化时间
	let initialTime = new Date()
	// 转化为到时：分：秒
	initialTime.setHours(timeArr[0],timeArr[1],timeArr[2]) 
	// 加上分钟数
	initialTime.setMinutes(initialTime.getMinutes() + theMinutes)
	let resultHour = initialTime.getHours();
	let resultMinutes  = initialTime.getMinutes();
	return `${resultHour}:${resultMinutes < 10 ? '0' : ''}${resultMinutes}`
}