Развертывание.
1. docker import vexbot.tar vexbot
2.
docker run \
--name vexbot_release \
-d \
-e TWITTER_CONSUMER_KEY=DZGoRbhEHaepFp1akpYqF3uBq \
-e TWITTER_CONSUMER_SECRET=8k45ppDYcHViTA2v7PhXqxMDSbLTFl60BLVMMQDC2GdTelK7hs \
-e TWITTER_ACCESS_TOKEN_KEY=629345522-70aSOpx5ZKaukadUc0BEFEm0G7EPcLeoIHZ3o4gh \
-e TWITTER_ACCESS_TOKEN_SECRET=SEngMDxsjMA33ySyQP7RMhlPto6UbA6Ib6Z0cAg9hMeqU \
-e webhookurl=https://radius.iondv.ru/dockerbot \
-e bottoken=155337760:AAFctrjdJxpbZdyJU7HJeHzzqEFg7zBU8Ys \
-p 8311:8080 \
vexbot \
supervisord
3. docker stop vexbot_release
4. docker start vexbot_release