import dotenv from 'dotenv';
import Ecs20140526, * as $Ecs20140526 from '@alicloud/ecs20140526';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
dotenv.config();

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_POD_ID = process.env.RUNPOD_POD_ID;

const ALIBABA_ACCESS_KEY_ID = process.env.ALIBABA_ACCESS_KEY_ID;
const ALIBABA_ACCESS_KEY_SECRET = process.env.ALIBABA_ACCESS_KEY_SECRET;
const ALIBABA_INSTANCE_ID = process.env.ALIBABA_INSTANCE_ID;
const ALIBABA_REGION_ID = process.env.ALIBABA_REGION_ID || 'ap-southeast-1'; // Mặc định Singapore

// 1. Quản lý RunPod Pod
export async function controlRunPod(action: 'start' | 'stop' | 'status') {
  if (!RUNPOD_API_KEY || !RUNPOD_POD_ID) {
    console.log('[GPU-Controller] RunPod credentials hoặc Pod ID chưa được cấu hình.');
    return { success: false, message: 'Missing credentials' };
  }

  const url = `https://api.runpod.io/v1/user/pod/${RUNPOD_POD_ID}/${action}`;
  console.log(`[GPU-Controller] [RunPod] Đang gửi yêu cầu ${action.toUpperCase()} đến Pod: ${RUNPOD_POD_ID}...`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNPOD_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    console.log(`[GPU-Controller] [RunPod] ✅ Thành công:`, JSON.stringify(data));
    return { success: true, data };
  } catch (error: any) {
    console.error(`[GPU-Controller] [RunPod] ❌ Thất bại: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 2. Quản lý Alibaba Cloud ECS GPU (Sử dụng API REST chính thức)
export async function controlAlibabaCloud(action: 'StartInstance' | 'StopInstance' | 'DescribeInstanceStatus') {
  if (!ALIBABA_ACCESS_KEY_ID || !ALIBABA_ACCESS_KEY_SECRET || !ALIBABA_INSTANCE_ID) {
    console.log('[GPU-Controller] Alibaba Cloud Access Key hoặc Instance ID chưa được cấu hình.');
    return { success: false, message: 'Missing credentials' };
  }

  console.log(`[GPU-Controller] [Alibaba Cloud] Đang gửi yêu cầu ${action} đến Instance: ${ALIBABA_INSTANCE_ID}...`);

  try {
    const config = new $OpenApi.Config({
      accessKeyId: ALIBABA_ACCESS_KEY_ID,
      accessKeySecret: ALIBABA_ACCESS_KEY_SECRET,
      endpoint: `ecs.${ALIBABA_REGION_ID}.aliyuncs.com`
    });

    const EcsClient = ($Ecs20140526.default as any).default || $Ecs20140526.default || $Ecs20140526;
    const client = new EcsClient(config);

    let data: any;

    if (action === 'StartInstance') {
      const request = new $Ecs20140526.StartInstanceRequest({
        instanceId: ALIBABA_INSTANCE_ID
      });
      const response = await client.startInstance(request);
      data = response.body;
    } else if (action === 'StopInstance') {
      const request = new $Ecs20140526.StopInstanceRequest({
        instanceId: ALIBABA_INSTANCE_ID,
        stoppedMode: 'StopCharging' // Chế độ tiết kiệm (Economical Mode) giải phóng tài nguyên CPU/RAM/GPU để ngừng tính tiền
      });
      const response = await client.stopInstance(request);
      data = response.body;
    } else if (action === 'DescribeInstanceStatus') {
      const request = new $Ecs20140526.DescribeInstancesRequest({
        regionId: ALIBABA_REGION_ID,
        instanceIds: JSON.stringify([ALIBABA_INSTANCE_ID])
      });
      const response = await client.describeInstances(request);
      const insts = response.body.instances?.instance || [];
      if (insts.length > 0) {
        data = {
          Status: insts[0].status,
          PublicIp: insts[0].publicIpAddress?.ipAddress?.[0] || '',
          InstanceName: insts[0].instanceName
        };
      } else {
        throw new Error(`Không tìm thấy InstanceId ${ALIBABA_INSTANCE_ID} ở vùng ${ALIBABA_REGION_ID}`);
      }
    }

    console.log(`[GPU-Controller] [Alibaba Cloud] ✅ Thành công:`, JSON.stringify(data));
    return { success: true, data };
  } catch (error: any) {
    console.error(`[GPU-Controller] [Alibaba Cloud] ❌ Thất bại: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// CLI Runner kiểm thử nhanh
const args = process.argv.slice(2);
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('gpu_controller.ts') || process.argv[1].endsWith('gpu_controller.js'));
if (isDirectRun && args.length > 0) {
  const provider = args[0]; // 'runpod' hoặc 'alibaba'
  const action = args[1] as any;  // 'start' | 'stop' | 'status'

  if (provider === 'runpod') {
    controlRunPod(action);
  } else if (provider === 'alibaba') {
    const actMap = { start: 'StartInstance', stop: 'StopInstance', status: 'DescribeInstanceStatus' };
    controlAlibabaCloud((actMap as any)[action]);
  } else {
    console.log('Sử dụng: npx tsx src/services/gpu_controller.ts [runpod|alibaba] [start|stop|status]');
  }
}
