window.cycle = {};
cycle.resize = function (img) {
    var width = img.width,
        height = img.height,
        radio = width / height,
        containWidth = img.parentNode.clientWidth;
    if (width > containWidth) {
        img.width = containWidth;
        img.height = containWidth / radio;
    }
}
baidu.dom.ready(
    function () {
        var cycleList = {"cycle_1":{cycleName:"音乐",
            friendCount:9,
            friendList:[
                {name:"泰妍", picture:"photo_3.jpg"},
                {name:"jessica", picture:"photo_2.jpg"},
                {name:"sunny", picture:"photo_5.jpg"},
                {name:"tiffany", picture:"photo_1.jpg"},
                {name:"孝渊", picture:"photo_9.jpg"},
                {name:"yuri", picture:"photo_7.jpg"},
                {name:"秀英", picture:"photo_6.jpg"},
                {name:"允儿", picture:"photo_4.jpg"},
                {name:"徐贤", picture:"photo_8.jpg"}
            ]
        },
            "cycle_2":{cycleName:"足球",
                friendCount:5,
                friendList:[
                    {name:"苏亚雷斯", picture:"sport_photo_1.jpg"},
                    {name:"托雷斯", picture:"sport_photo_2.jpg"},
                    {name:"兰帕德", picture:"sport_photo_3.jpg"},
                    {name:"内斯塔", picture:"sport_photo_4.jpg"},
                    {name:"pato", picture:"sport_photo_5.jpg"}
                ]
            }}, //圈子中的好友列表,
            cycleContainer = baidu.g("cycleContainer"),
            cycleWidth = 120,
            cycleHeight = 120,
            cycleCenter = {left:cycleWidth / 2, top:cycleHeight / 2}, //圆心
            friendRadius = 15, //好友圈圈的半径
            insideCycleRadius = cycleWidth / 2 - 15, //好友圈圈的圆心所在圆的半径
            friendLen = 10, //一个大圈里面放置十个好友圈圈
            fragment = document.createDocumentFragment(),
            setStyles = baidu.dom.setStyles,
            pi = Math.PI;
        var friendNotInCycleList = {
            "not_cycle_1":{name:"泰勒", picture:"photo_10.jpg"},
            "not_cycle_2":{name:"blue", picture:"photo_11.jpg"}
        }, //还未在圈子中的好友
            fragmentNotInCycle = document.createDocumentFragment(),
            friendNotInCycle = baidu.g("friendNotInCycle"),
            cyclePointInfo = {};//圈子的圆心位置信息
        //当前拖动到哪个圈子了
        var getIndexCyle = function (target) {
            var position = baidu.dom.getPosition(target);
            for (var i in cyclePointInfo) {
                var cycle = cyclePointInfo[i],
                    x = position.left + target.offsetWidth / 2 - cycle.x,
                    y = position.top + target.offsetHeight / 2 - cycle.y;
                if (x * x + y * y <= (cycle.r * cycle.r)) {
                    return i;
                }

            }
            return -1;
        };
        /*rander好友圈子*/
        var cycleIndex,
            selectedInfo = {};
        var randerCycle = function (container, cycleInfo) {
            container.innerHTML = "";//清空container里面的内容
            var cycleName = cycleInfo.cycleName,
                friendCount = cycleInfo.friendCount,
                friendList = cycleInfo.friendList,
                friendFragment = document.createDocumentFragment();
            for (var i = 0; i < friendLen; i++) {
                var friend = friendList[i];
                if (friend) {
                    var friendDiv = baidu.dom.create("div", {className:"friend", id:"friend_" + i}),
                        left = 0,
                        top = 0;
                    friendDiv.innerHTML = "<img onload='cycle.resize(this)' src='../static/img/" + friend.picture + "'/>";
                    friendDiv.title = friend.name,
                        left = cycleCenter.left + insideCycleRadius * Math.sin(2 * pi * (i / friendLen)) - friendRadius;
                    top = cycleCenter.top - insideCycleRadius * Math.cos(2 * pi * (i / friendLen)) - friendRadius;
                    setStyles(friendDiv, {position:"absolute", left:left + "px", top:top + "px", display:"none"});
                    friendFragment.appendChild(friendDiv);
                }
            }
            container.appendChild(friendFragment);
            var cycleNameDiv = baidu.dom.create("div", {className:"in-side"});
            cycleNameDiv.innerHTML = cycleName + '<span class="friend-count">' + friendCount + '</span>';
            container.appendChild(cycleNameDiv);
        };
        //设置cycle的圆心位置信息
        var setcyclePointInfo = function (id, item) {
            var point = cyclePointInfo[id] = {},
                position = baidu.dom.getPosition(item);
            point.x = position.left + item.offsetWidth / 2;
            point.y = position.top + item.offsetHeight / 2;
            point.r = item.clientWidth / 2;
        }
        //拖动中
        var dragNow = function (target, option) {
            var targetPosition = baidu.dom.getPosition(target);
            baidu.dom.addClass(target, "drager");
            baidu.dom.addClass(target, "selected");
            baidu.array.each(baidu.dom.query("#friendNotInCycle a[selected=\"true\"]"), function (item, i) {
                console.log(item.id);
                selectedInfo[item.id] = item.id;
                if (item != target) {
                    setStyles(item, {left:targetPosition.left + "px", top:targetPosition.top + "px"});
                }
            });
            //碰撞检测，是否拖入圈子
            cycleIndex = getIndexCyle(target);
            if (cycleIndex != -1) {
                var cycleObj = baidu.g(cycleIndex);
                baidu.dom.addClass(cycleObj, "cycle-hover");
                t = setTimeout(function () {
                    var friends = baidu.q("friend", cycleObj);
                    baidu.array.each(friends, function (item, i) {
                        baidu.dom.addClass(item, "friend-hover");
                    });
                }, 500);
                setcyclePointInfo(cycleIndex, cycleObj);
            }
        };

        //拖动结束
        var dragEnd = function (target, option) {
         
           baidu.dom.addClass(target, "selected");
            if (cycleIndex && cycleIndex != -1) {
                for (var i in selectedInfo) {
                    cycleList[cycleIndex].friendList.unshift(friendNotInCycleList[i]);
                    cycleList[cycleIndex].friendCount += 1;
                    var selectedObj = baidu.g(i);
                    selectedObj.parentNode.removeChild(selectedObj);
                    delete selectedInfo[i];
                }
                //碰撞检测，是否拖入圈子
                var cycleObj = baidu.g(cycleIndex);
                randerCycle(cycleObj, cycleList[cycleIndex]);
                var friends = baidu.q("friend", cycleObj);
                baidu.array.each(friends, function (item, i) {
                    item.style.display = "";
                });
                cycleIndex = null;
            }
            else {
                for (var i in selectedInfo) {
                    var selectedObj = baidu.g(i),
                        sourcePosition = friendNotInCycleList[i].position;
                    setStyles(selectedObj, {left:sourcePosition.left, top:sourcePosition.top});
                    delete selectedInfo[i];
                }
            }
           
        };

        cycle.init = function () {
            for (var i  in cycleList) {
                var cycleDiv = baidu.dom.create("div", {className:"out-side", id:i});
                var bindEvent = function (obj, index) {
                    var t;
                    baidu.on(obj, "mouseover", function (e) {
                        var relatedTarget = e.relatedTarget || e.fromElement;
                        if (relatedTarget == obj || baidu.dom.contains(obj, relatedTarget)) {
                            return;
                        }
                        baidu.dom.addClass(obj, "cycle-hover");
                        t = setTimeout(function () {
                            var friends = baidu.q("friend", obj);
                            baidu.array.each(friends, function (item, i) {
                                item.style.display = "";
                                baidu.dom.addClass(item, "friend-hover");
                            });
                        }, 500);

                    });

                    baidu.on(obj, "mouseout", function (e) {
                        var relatedTarget = e.relatedTarget || e.toElement;
                        if (relatedTarget == obj || baidu.dom.contains(obj, relatedTarget)) {
                            return;
                        }
                        clearTimeout(t);
                        baidu.dom.removeClass(obj, "cycle-hover");
                        setTimeout(function () {
                            setcyclePointInfo(obj.id, obj);
                        }, 500);
                        var friends = baidu.q("friend", obj);
                        baidu.array.each(friends, function (item, i) {
                            item.style.display = "none";
                            baidu.dom.removeClass(item, "friend-hover");
                        });
                    });
                }

                randerCycle(cycleDiv, cycleList[i]);
                bindEvent.apply(cycleDiv, [cycleDiv, i]);
                var cycleDivContainer = baidu.dom.create("div", {className:"cycle"});
                cycleDivContainer.appendChild(cycleDiv);
                fragment.appendChild(cycleDivContainer);
            }
            cycleContainer.appendChild(fragment);
            //不在圈子里面好友的rander
            for (var j in friendNotInCycleList) {
                var a = baidu.dom.create("a", {className:"not-friend"}),
                    notFriend = friendNotInCycleList[j],
                    htmlArray = [];
                a.id = j;
                htmlArray.push('<span><img onload="cycle.resize(this)" src="../static/img/');
                htmlArray.push(notFriend.picture);
                htmlArray.push('"/></span>');
                htmlArray.push(notFriend.name);
                a.innerHTML = htmlArray.join("");
                a.href = "#";
                if (j != "not_cycle_1") {
                    setStyles(a, {left:(parseInt(j.split("_")[2]) - 1) * 100 + 20});
                }
                fragmentNotInCycle.appendChild(a);
            }
            friendNotInCycle.appendChild(fragmentNotInCycle);
            //收集cycle的圆心位置信息
            baidu.array.each(baidu.dom.query(".cycle .out-side"), function (item, i) {
                setcyclePointInfo(item.id, item);
            });
            baidu.array.each(baidu.dom.query("#friendNotInCycle .not-friend"), function (item, i) {
                var obj = item;
                friendNotInCycleList[obj.id].position = {left:obj.offsetLeft,top:obj.offsetTop};
                //绑定点击事件
                baidu.on(obj, "mousedown", function (e) {
                    setTimeout(function(){
                    var selected = baidu.dom.getAttr(obj, "selected");
                    if (selected && selected == "true") {
                        baidu.dom.removeClass(obj, "selected");
                        baidu.dom.setAttr(obj,"selected",false);
                    }
                    else {
                        baidu.dom.setAttr(obj,"selected",true);
                        baidu.dom.addClass(obj, "selected");
                    }   
                    },300);
                    baidu.event.preventDefault(e);
                });
                //绑定拖动事件
                baidu.on(obj, "mousedown", function () {
                    baidu.dom.drag(obj, {
                        ondrag:dragNow,
                        ondragend:dragEnd});
                });

            });
        };

        cycle.init();
    });