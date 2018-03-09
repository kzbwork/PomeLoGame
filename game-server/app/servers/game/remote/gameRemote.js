let co = require("co");
let app = require("pomelo").app;

module.exports = function(app) {
    return new gameRemote(app);
};

let gameRemote = function(app) {
    this.app = app;
};

//默认通道名
const defalutchannnel = "test";
let pro = gameRemote.prototype;
let config = require("../../../../config/game.json");


pro.spain = function (uid, linesnum, linevalue, cb) {
    console.log(`uid = ${uid},linesnum = ${linevalue},linevalue`);
    co(function*(){
        let result = this.playgame(linesnum,linevalue);
        cb(result);
    }).catch(function (err) {
        console.error(err.stack);
        cb(null, {code: app.consts.CODE.SPAIN_FAILD});
    });
}

/**
 * 用户登入时加入chnnel
 * @param uid 用户ID
 * @param sid serverID
 * @param flag 是否添加channel
 * @param cb 回掉函数 返回用户信息
 */
pro.add = function (uid,sid,flag,cb) {
    var channel = this.channelService.getChannel(defalutchannnel, flag);
    if( !! channel) {
        channel.add(uid, sid);
    }
    var userinfo = {
        uid : uid,
        redit:500
    }
    cb(userinfo);
}

pro.playgame = function(linesnum,linevalue)
{
    //获取押注倍率
    let conins = linesnum*linevalue;
    //获取原始二维数组
    let baseArr = this.createArray();
    //获取所有盈利线数组
    let lineArr = this.MathToReward(baseArr);
    //获取盈利详情
    let RewardResult = this.MathToRedit(lineArr,conins);
    //获取盈利总金额
    let winsTotalRedit = this.getWinRedit(conins,RewardResult);
    let result = {
        code:app.consts.SPAIN_SUCCESS,
        data:{
            baseArr:baseArr,
            rewardInfo:RewardResult,
            totalWins:winsTotalRedit
        }
    }
    return result;
}

pro.getWinRedit = function(coins,RewardResult)
{
    //每条线的押注额等于倍数乘以金额
    //总营收等于总金额减去赢的金额
    let money = coins*10;
    let winsMoney = 0;
    let finalMoney = 0;
    for(let a of RewardResult)
    {
        winsMoney = winsMoney + a.wins_totalredit;
    }
    //计算盈利情况
    let IsWin = false;
    if (winsMoney >= money )
    {
        finalMoney = winsMoney - money;
        IsWin = true;
    }
    else
    {
        finalMoney = money - winsMoney;
        IsWin = false;
    }

    let result={
        finalMoney:finalMoney,
        Iswin:IsWin
    }
    cb(null,result);
}


/**
 * 随机一个3行五列游戏面板,保证竖向不相等
 * @returns {*}
 */
pro.createArray = function(){
    let arrreult = new Array();
    //这边元素从config中取出
    let arr = this.cloneConfig();
    //创建3行五列的数组
    for(let i = 0;i <3;i++)
    {
        arrreult[i] = new Array();
        for(let j = 0; j < 5 ;j ++)
        {
            switch(i)
            {
                case 0:
                    //计算第一行时不需要判断是否出现重复
                    arrreult[i][j] = Math.floor((arr.length)*Math.random());
                    break;
                case 1:
                    //计算第二行时需要判断是否跟第一行的元素相等
                    let first = arrreult[0][j];
                    let temparr = null;
                    if(first == 0)
                    {
                        temparr = arr.slice(1);
                    }
                    else
                    {
                        temparr = arr.slice(0,first).concat(arr.slice(first + 1));
                    }
                    arrreult[i][j] = temparr[Math.floor((temparr.length)*Math.random())];
                    break;
                case 2:
                    //计算第三行时需要判断是否跟第一行和第二行同等位置的元素相等
                    let first2 = arrreult[0][j];
                    let second = arrreult[1][j];
                    //依次去除掉数组的第一行和第二行的元素
                    let tempfirstarr = null;
                    let tempsecondarr = null;
                    if(first2 == 0)
                    {
                        tempfirstarr = arr.slice(1);
                    }
                    else
                    {
                        tempfirstarr = arr.slice(0,first2).concat(arr.slice(first2 + 1));
                    }
                    let secondindex = tempfirstarr.indexOf(second);
                    if(secondindex == 0)
                    {
                        tempsecondarr = tempfirstarr.slice(1);
                    }
                    else
                    {
                        tempsecondarr = tempfirstarr.slice(0,secondindex).concat(tempfirstarr.slice(secondindex + 1));
                    }
                    arrreult[i][j] = tempsecondarr[Math.floor((tempsecondarr.length)*Math.random())];
                    break;
            }
        }
    }
    console.log((arrreult))
    return arrreult;
}

/*
返回一个克隆数组
 */
pro.cloneConfig = function()
{
    let arr = new Array();
    for(let i=0; i<9 ; i++)
    {
        arr[i] = i;
    }
    return arr;
}

pro.MathToReward = function(arr)
{
    let resultarr = new Array();
    for(let i = 0; i < config.line.length;i++)
    {
        resultarr[i] = new Array();
        for(let j = 0; j < config.line[i].length;j++)
        {
            //通过遍历line中的中奖线给定中奖信息
            let x = config.line[i][j][0];
            let y = config.line[i][j][1];
            resultarr[i][j] = arr[x][y];
        }
    }
    return resultarr;
}


pro.MathToRedit = function(arr,coins)
{
    let rewardlist = [];
    console.log(arr);
    //依次遍历赢的线
    for(let a of config.reward)
    {
        this.GetRewardIsHave(a,arr,rewardlist,coins);
    }
    console.log(rewardlist);
    return rewardlist;
}

pro.GetRewardIsHave = function(reward,arr,rewardlist,coins)
{
    for(let j=0;j<10;j++)
    {
        let result = { };
        if(arr[j].indexOf(reward.rewardid) > -1)
        {
            let tempnum = 0;
            for(let i = 0;i<5;i++)
            {
                if(arr[j][i] == reward.rewardid)
                {
                    tempnum++;
                }
            }

            if (tempnum == reward.num)
            {
                result.wins_line = arr.indexOf(arr[j]);
                result.wins_type = reward.rewardid;
                result.wins_num = reward.num;
                result.wins_redit = reward.wins;
                result.wins_totalredit = reward.wins*coins;
                rewardlist.push(result);
            }
        }
    }
}