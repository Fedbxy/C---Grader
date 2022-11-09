#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(0);
    int m,n;cin>>m>>n;
    int k;cin>>k;
    int a[m][n];
    for(int i=0;i<m;i++){
        for(int j=0;j<n;j++){
            cin>>a[i][j];
        }
    }
    int mx=INT_MIN;
    for(int i=0;i<m-k+1;i++){
        for(int j=0;j<n-k+1;j++){
            int sum=0;
            for(int p=i;p<i+k;p++){
                for(int q=j;q<j+k;q++){
                    sum+=a[p][q];
                }
            }
            if(sum>mx){
                mx=sum;
            }
        }
    }
    cout<<mx<<"\n";
    return 0;
}