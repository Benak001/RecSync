class rooms{
    constructor(){
        this.room={};
    }
    createRoom(userid,id,hostId){
        if(!this.room[id]){
            this.room[id]={users:[],host:hostId};
            return true;
        }
        return false;
    }
    joinRoom(user,roomId){
        if(this.room[roomId]){
              if (!this.room[roomId].users.includes(user)) {
                this.room[roomId].users.push(user);
                return this.room[roomId].host;
              }
        }
        return false;
    }
    leaveRoom(user,roomId){
        if(this.room[roomId]){
            this.room[roomId].users=this.room[roomId].users.filter(id=>id!=user);
            if(this.room[roomId].users.length<=0){
                delete this.room[roomId];
            }
            return true;
        }
        return false;
    }
    exists(roomid){
        if(this.room[roomid]){
            return true;
        }
        return false;
    }
}
export {rooms};