# ICP-Movies
The code provides a basic structure for managing users, proposals and votes in a distributed ledger system. It allows users to create, delete, and vote on proposals, while also providing functions to read and retrieve data.

## How to run the project
- Clone the repository
```
git clone https://github.com/cosmasken/tickets-icp-canister.git
```
- Install dependencies
```
npm install
```
- Start DFX (omit `--clean` param on subsequent starts unless you'd like to start with clean data)
```
dfx start --background --clean
```
- Deploy canister
```
dfx deploy
```

## Use cases
- Create a user
```
createUser: (text) → (record {id:principal; username:text; votes:vec record {id:principal; voteType:bool; createdAt:nat64; voterId:principal; proposalId:principal}; recordingIds:vec principal; createdAt:nat64; proposalIds:vec principal})
```
You will get a message:
```
(record {id=principal "idmey-ixcjg-gyds7-o6dli-p6q26-55bxg-srjy2-oexre-u3lun-mvz3h-o2c"; username="new"; votes=vec {}; recordingIds=vec {}; createdAt=1695820629044439800; proposalIds=vec {}})

```

- Create a proposal
```
createProposal: (text, text, principal) → (variant {Ok:record {id:principal; votes:vec record {id:principal; voteType:bool; createdAt:nat64; voterId:principal; proposalId:principal}; userId:principal; name:text; createdAt:nat64; description:text; noOfVotes:nat32}; Err:variant {UserDoesNotExist:principal}})
```
You will get the message:
```
(variant {Ok=record {id=principal "jedxh-643yf-f6ltz-aswtw-jjg5c-um3r3-jfinm-oeidz-lnhp2-t6egp-i3s"; votes=vec {}; userId=principal "s3dwk-teqve-s2v4s-rbu54-lvefg-v6mn6-k3uvm-rschb-3fm3a-43xko-j6w"; name="proposaltitle"; createdAt=1695817585156980500; description="descriprion"; noOfVotes=0}})
```
- Add vote
```
vote: (principal, principal, bool) → (variant {Ok:record {id:principal; votes:vec record {id:principal; voteType:bool; createdAt:nat64; voterId:principal; proposalId:principal}; userId:principal; name:text; createdAt:nat64; description:text; noOfVotes:nat32}; Err:variant {UserDoesNotExist:principal; ProposalDoesNotExist:principal}})
```
You will get the message:
```
(variant {Ok=record {id=principal "jedxh-643yf-f6ltz-aswtw-jjg5c-um3r3-jfinm-oeidz-lnhp2-t6egp-i3s"; votes=vec {record {id=principal "g6cq7-nlu7u-6t63t-radso-xnbmf-vwwsy-3zcwb-5ckgj-vffve-3s4k7-osa"; voteType=true; createdAt=1695817637151978600; voterId=principal "s3dwk-teqve-s2v4s-rbu54-lvefg-v6mn6-k3uvm-rschb-3fm3a-43xko-j6w"; proposalId=principal "jedxh-643yf-f6ltz-aswtw-jjg5c-um3r3-jfinm-oeidz-lnhp2-t6egp-i3s"}; record {id=principal "wjj5e-tpelp-3dya2-a3zgj-3kpy6-ebvxq-byeld-46txc-yywdc-dz4kj-vke"; voteType=false; createdAt=1695817756517066200; voterId=principal "6n2tf-hl4ny-admt2-2bkmj-vtnxm-t4cqd-qhtms-fo5e7-d2cpy-qdfzi-nek"; proposalId=principal "jedxh-643yf-f6ltz-aswtw-jjg5c-um3r3-jfinm-oeidz-lnhp2-t6egp-i3s"}}; userId=principal "s3dwk-teqve-s2v4s-rbu54-lvefg-v6mn6-k3uvm-rschb-3fm3a-43xko-j6w"; name="proposaltitle"; createdAt=1695817585156980500; description="descriprion"; noOfVotes=2}})
```
- To be done
 -Prevent user from double voting

