import { ref, reactive } from 'vue';
import { getUserLocationScope } from '../../utils/getSettingScope';
import { getLocation } from '@/utils/index.js';
export default function useForm(showMessage) {
  const sequence = ['phone', 'username', 'remarks'];

  const forms = reactive({
    phone: '',
    username: '',
    remarks: '',
    address: '',
    latitude: 0,
    longitude: 0,
    ordertime: '',
    images: [],
    videos: [],
    maxImageCount: 3,
    maxVideoCount: 1
  });
  const formList = reactive([
    {
      label: '电话',
      required: true,
      value: '',
      placeholder: '请输入联系号码以便沟通',
      candidates: []
    },
    {
      label: '姓名',
      required: false,
      value: '',
      placeholder: '请输入姓氏或姓名',
      candidates: []
    },
    {
      label: '备注',
      required: false,
      value: '',
      placeholder: '可简单备注，如物品大小',
      candidates: []
    }
  ]);

  // location icon
  function iconClick() {
    uni.chooseLocation({
      success({ address, latitude, longitude }) {
        forms.address = address;
        forms.latitude = latitude;
        forms.longitude = longitude;
      },
      fail() {
        console.log('map fail');
      }
    });
  }

  function submit() {
    checkForm()
      .then(() => {
        console.log(forms);
      })
      .catch(msg => {
        showMessage('error', msg);
      });
  }

  function checkForm() {
    sequence.forEach((key, index) => {
      forms[key] = formList[index]['value'].trim();
    });
    return Promise.resolve()
      .then(() => {
        if (forms.phone) {
          return;
        }
        throw new Error('联系号码为空');
      })
      .then(() => {
        if (forms.ordertime > Date.now() - 1 * 60 * 60 * 1000) {
          return;
        }
        throw new Error('预约时间不正确，点击日期后请选择时间');
      })
      .then(() => {
        // 检查经纬度是否存在，如果不存在经纬度，则获取当前的位置
        if (forms.latitude && forms.longitude) return;
        return getLocation();
      })
      .then(({ latitude, longitude } = {}) => {
        if (latitude && longitude) {
          forms.latitude = latitude;
          forms.longitude = longitude;
        }
      });
  }

  return {
    forms,
    formList,
    iconClick,
    submit,
    checkForm
  };
}