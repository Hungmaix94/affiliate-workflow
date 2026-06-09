import Ecs20140526, * as $Ecs20140526 from '@alicloud/ecs20140526';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import dotenv from 'dotenv';
dotenv.config();

const accessKeyId = process.env.ALIBABA_ACCESS_KEY_ID;
const accessKeySecret = process.env.ALIBABA_ACCESS_KEY_SECRET;

async function listInstances(regionId: string) {
  if (!accessKeyId || !accessKeySecret) {
    throw new Error('Thiếu Access Key ID hoặc Access Key Secret trong tệp .env');
  }

  const config = new $OpenApi.Config({
    accessKeyId,
    accessKeySecret,
    endpoint: `ecs.${regionId}.aliyuncs.com`
  });
  
  const EcsClient = ($Ecs20140526.default as any).default || $Ecs20140526.default || $Ecs20140526;
  const client = new EcsClient(config);
  const request = new $Ecs20140526.DescribeInstancesRequest({
    regionId: regionId
  });
  
  try {
    const response = await client.describeInstances(request);
    console.log(`Region ${regionId} response body:`, JSON.stringify(response.body));
    return response.body.instances?.instance || [];
  } catch (error: any) {
    console.log(`Region ${regionId} check error: ${error.message}`);
    return [];
  }
}

async function main() {
  const regions = [
    'ap-southeast-1', // Singapore
    'ap-southeast-2', // Sydney
    'ap-southeast-3', // Kuala Lumpur
    'ap-southeast-5', // Jakarta
    'ap-southeast-6', // Manila
    'ap-southeast-7', // Bangkok
    'cn-hongkong',    // Hong Kong
    'ap-northeast-1', // Tokyo
    'ap-northeast-2', // Seoul
    'cn-hangzhou',    // Hangzhou
    'cn-beijing',     // Beijing
    'cn-shanghai',    // Shanghai
    'cn-shenzhen',    // Shenzhen
    'us-west-1',      // Silicon Valley
    'us-east-1'       // Virginia
  ];
  
  console.log('=== ĐANG QUÉT TÌM INSTANCE TRÊN ALIBABA CLOUD ===');
  
  let foundAny = false;

  for (const region of regions) {
    try {
      const instances = await listInstances(region);
      if (instances.length > 0) {
        foundAny = true;
        console.log(`\n📍 Tìm thấy ${instances.length} instance(s) tại vùng [${region}]:`);
        for (const inst of instances) {
          console.log(`- Instance ID: ${inst.instanceId}`);
          console.log(`  Tên máy chủ: ${inst.instanceName}`);
          console.log(`  Loại máy (Instance Type): ${inst.instanceType}`);
          console.log(`  Trạng thái hoạt động: ${inst.status}`);
          console.log(`  IP Công cộng: ${inst.publicIpAddress?.ipAddress?.join(', ') || 'không có'}`);
          console.log(`  IP Nội bộ: ${inst.innerIpAddress?.ipAddress?.join(', ') || 'không có'}`);
        }
      }
    } catch (e: any) {
      console.error(`Lỗi kiểm tra vùng ${region}:`, e.message);
    }
  }
  
  if (!foundAny) {
    console.log('\n❌ Không tìm thấy máy chủ ECS nào trên tài khoản này ở các vùng Đông Nam Á & Trung Quốc.');
  }
  
  console.log('\n=== QUÉT HOÀN TẤT ===');
}

main();
