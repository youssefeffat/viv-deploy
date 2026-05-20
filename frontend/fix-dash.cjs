const fs = require('fs');
let t = fs.readFileSync('frontend/src/components/DashboardPage.tsx', 'utf8');
t = t.replace(/name: "Mobility"/g, 'name: "Mobilitè"');
t = t.replace(/name: "Food"/g, 'name: "Alimentation"');
t = t.replace(/name: "Energy"/g, 'name: "Énergie"');
t = t.replace(/name: "Lifestyle"/g, 'name: "Mode de vie"');
t = t.replace(/Ã�ۙ\��YK��	��[�\��YI�NH��\X�JȒ�S���	Ȓ�RS��N�˝ܚ]Q�[T�[��	ٜ�۝[��ܘ����\ۙ[���\���\�Y�K��	��Y��\�����J	�]�	�JN